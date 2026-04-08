"""
cottoncast/ml/indicators.py - Vectorized Technical Indicators Engine
"""

import numpy as np
import pandas as pd


def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    rs = avg_gain / (avg_loss + 1e-10)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return rsi.bfill()


def compute_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    hist = macd_line - signal_line
    return pd.DataFrame(
        {"macd": macd_line, "macd_signal": signal_line, "macd_hist": hist},
        index=series.index,
    )


def compute_bollinger_bands(series: pd.Series, period: int = 20, num_std: float = 2.0) -> pd.DataFrame:
    sma = series.rolling(window=period, min_periods=period).mean()
    std = series.rolling(window=period, min_periods=period).std()
    upper = sma + (std * num_std)
    lower = sma - (std * num_std)
    bandwidth = (upper - lower) / (sma + 1e-10)
    pct_b = (series - lower) / (upper - lower + 1e-10)
    return pd.DataFrame(
        {
            "bb_middle": sma.bfill(),
            "bb_upper": upper.bfill(),
            "bb_lower": lower.bfill(),
            "bb_bandwidth": bandwidth.bfill(),
            "bb_pct_b": pct_b.bfill(),
        },
        index=series.index,
    )


def compute_atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    prev_close = close.shift(1)
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    return atr.bfill()


def add_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    res = df.copy()
    res["log_return"] = np.log(res["Close"] / res["Close"].shift(1)).fillna(0)
    res["rsi_14"] = compute_rsi(res["Close"], period=14)
    macd_df = compute_macd(res["Close"], 12, 26, 9)
    res["macd"] = macd_df["macd"]
    res["macd_signal"] = macd_df["macd_signal"]
    res["macd_hist"] = macd_df["macd_hist"]
    bb_df = compute_bollinger_bands(res["Close"], 20, 2.0)
    res["bb_middle"] = bb_df["bb_middle"]
    res["bb_upper"] = bb_df["bb_upper"]
    res["bb_lower"] = bb_df["bb_lower"]
    res["bb_bandwidth"] = bb_df["bb_bandwidth"]
    res["bb_pct_b"] = bb_df["bb_pct_b"]
    res["atr_14"] = compute_atr(res["High"], res["Low"], res["Close"], 14)
    res.bfill(inplace=True)
    res.ffill(inplace=True)
    return res


FEATURE_COLUMNS = [
    "Close",
    "High",
    "Low",
    "Volume",
    "log_return",
    "rsi_14",
    "macd",
    "macd_signal",
    "macd_hist",
    "bb_bandwidth",
    "bb_pct_b",
    "atr_14",
]
