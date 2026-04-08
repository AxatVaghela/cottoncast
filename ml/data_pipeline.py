"""
cottoncast/ml/data_pipeline.py - Ingestion & Chronological Split Pipeline
"""

import os
import sys
import pickle
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any
from sklearn.preprocessing import RobustScaler

CUR_DIR = os.path.abspath(os.path.dirname(__file__))
if CUR_DIR not in sys.path:
    sys.path.insert(0, CUR_DIR)

from indicators import add_all_indicators, FEATURE_COLUMNS

ARTIFACTS_DIR = os.path.abspath(os.path.join(CUR_DIR, "artifacts"))


def fetch_or_generate_cotton_data(csv_path: str = None) -> pd.DataFrame:
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    cache_path = os.path.join(ARTIFACTS_DIR, "cotton_raw_ct_f.csv")
    if os.path.exists(cache_path):
        df = pd.read_csv(cache_path, parse_dates=["Date"])
        df.set_index("Date", inplace=True)
        return df

    try:
        import yfinance as yf
        print("[data_pipeline] Attempting yfinance download for CT=F...")
        data = yf.download("CT=F", start="2000-01-01", progress=False)
        if len(data) > 500:
            data = data[["Open", "High", "Low", "Close", "Volume"]].dropna()
            data.index.name = "Date"
            data.to_csv(cache_path)
            return data
    except Exception as e:
        print(f"[data_pipeline] yfinance fallback triggered: {e}")

    dates = pd.date_range(start="2000-01-03", end="2026-04-03", freq="B")
    n = len(dates)
    np.random.seed(42)

    t = np.linspace(0, 1, n)
    macro_trend = 56.0 + 10.0 * np.sin(2 * np.pi * 1.5 * t) + 16.0 * np.sin(2 * np.pi * 0.4 * t)
    spike_2011 = 118.0 * np.exp(-((t - 0.428) ** 2) / (2 * (0.018 ** 2)))
    surge_2022 = 62.0 * np.exp(-((t - 0.852) ** 2) / (2 * (0.025 ** 2)))
    dip_2008 = -20.0 * np.exp(-((t - 0.342) ** 2) / (2 * (0.012 ** 2)))
    dip_2020 = -16.0 * np.exp(-((t - 0.776) ** 2) / (2 * (0.010 ** 2)))

    base = macro_trend + spike_2011 + surge_2022 + dip_2008 + dip_2020
    returns = np.random.normal(loc=0.0001, scale=0.014, size=n)

    close_arr = np.zeros(n)
    close_arr[0] = 52.80
    for i in range(1, n):
        mean_rev = 0.007 * (base[i] - close_arr[i - 1])
        close_arr[i] = max(30.0, close_arr[i - 1] * np.exp(returns[i]) + mean_rev)

    spread = np.abs(np.random.normal(0.012, 0.005, n)) * close_arr
    high_arr = close_arr + spread * np.random.uniform(0.4, 0.9, n)
    low_arr = np.maximum(25.0, close_arr - spread * np.random.uniform(0.4, 0.9, n))
    open_arr = low_arr + (high_arr - low_arr) * np.random.uniform(0.2, 0.8, n)
    vol_arr = (np.random.lognormal(9.6, 0.5, n) * (1.0 + 2.0 * (high_arr - low_arr) / close_arr)).astype(int)

    df = pd.DataFrame(
        {
            "Open": np.round(open_arr, 2),
            "High": np.round(high_arr, 2),
            "Low": np.round(low_arr, 2),
            "Close": np.round(close_arr, 2),
            "Volume": vol_arr,
        },
        index=dates,
    )
    df.index.name = "Date"
    df.to_csv(cache_path)
    return df


def clean_and_winsorize(df: pd.DataFrame, lower_pct: float = 0.005, upper_pct: float = 0.995) -> pd.DataFrame:
    cleaned = df.asfreq("B")
    cleaned.ffill(inplace=True)
    cleaned.bfill(inplace=True)

    ret = cleaned["Close"].pct_change()
    lower_bound = ret.quantile(lower_pct)
    upper_bound = ret.quantile(upper_pct)
    clipped_ret = ret.clip(lower=lower_bound, upper=upper_bound)

    reconstructed_close = [cleaned["Close"].iloc[0]]
    for r in clipped_ret.iloc[1:]:
        reconstructed_close.append(reconstructed_close[-1] * (1.0 + (r if not np.isnan(r) else 0.0)))
    cleaned["Close"] = np.round(reconstructed_close, 2)
    cleaned["High"] = np.maximum(cleaned["High"], cleaned["Close"])
    cleaned["Low"] = np.minimum(cleaned["Low"], cleaned["Close"])
    return cleaned


def create_sliding_sequences(features: np.ndarray, targets: np.ndarray, window_size: int = 60) -> Tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    for i in range(window_size, len(features)):
        X.append(features[i - window_size : i])
        y.append(targets[i])
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def prepare_chronological_splits(
    df: pd.DataFrame,
    window_size: int = 60,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
) -> Dict[str, Any]:
    feat_df = add_all_indicators(df)
    n = len(feat_df)
    train_idx = int(n * train_ratio)
    val_idx = int(n * (train_ratio + val_ratio))

    train_data = feat_df.iloc[:train_idx]
    val_data = feat_df.iloc[train_idx:val_idx]
    test_data = feat_df.iloc[val_idx:]

    feature_scaler = RobustScaler()
    target_scaler = RobustScaler()

    train_scaled = feature_scaler.fit_transform(train_data[FEATURE_COLUMNS])
    val_scaled = feature_scaler.transform(val_data[FEATURE_COLUMNS])
    test_scaled = feature_scaler.transform(test_data[FEATURE_COLUMNS])

    train_target = target_scaler.fit_transform(train_data[["Close"]])
    val_target = target_scaler.transform(val_data[["Close"]])
    test_target = target_scaler.transform(test_data[["Close"]])

    X_train, y_train = create_sliding_sequences(train_scaled, train_target, window_size)
    X_val, y_val = create_sliding_sequences(val_scaled, val_target, window_size)
    X_test, y_test = create_sliding_sequences(test_scaled, test_target, window_size)

    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    scaler_path = os.path.join(ARTIFACTS_DIR, "scaler.pkl")
    with open(scaler_path, "wb") as f:
        pickle.dump({"feature_scaler": feature_scaler, "target_scaler": target_scaler}, f)

    return {
        "X_train": X_train,
        "y_train": y_train,
        "X_val": X_val,
        "y_val": y_val,
        "X_test": X_test,
        "y_test": y_test,
        "train_df": train_data,
        "val_df": val_data,
        "test_df": test_data,
        "feature_scaler": feature_scaler,
        "target_scaler": target_scaler,
        "feat_df": feat_df,
    }
