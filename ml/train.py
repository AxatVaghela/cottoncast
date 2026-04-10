"""
cottoncast/ml/train.py - Full End-to-End Training & Pipeline Execution
Executes the data pipeline, compiles and trains the 3-layer Stacked LSTM with Attention,
computes 90-day MC dropout forecast, and exports all production JSON artifacts.
"""

import os
import sys
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

# Ensure ml directory is on sys.path
CUR_DIR = os.path.abspath(os.path.dirname(__file__))
if CUR_DIR not in sys.path:
    sys.path.insert(0, CUR_DIR)

from data_pipeline import fetch_or_generate_cotton_data, clean_and_winsorize, prepare_chronological_splits
from indicators import add_all_indicators, FEATURE_COLUMNS
from model import build_cottoncast_model
from forecast import run_mc_dropout_forecast
from evaluate import run_walk_forward_evaluation, export_history_json

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "artifacts"))


def run_full_training(epochs: int = 15, batch_size: int = 64):
    print("=" * 65)
    print(" COTTONCAST: DEEP LSTM + ATTENTION MONOREPO TRAINING PIPELINE")
    print("=" * 65)

    # 1. Ingest and clean
    raw_df = fetch_or_generate_cotton_data()
    cleaned_df = clean_and_winsorize(raw_df)
    feat_df = add_all_indicators(cleaned_df)
    print(f"[train] Prepared {len(feat_df)} historical trading sessions with {len(FEATURE_COLUMNS)} features.")

    # 2. Chronological splits
    splits = prepare_chronological_splits(cleaned_df, window_size=60)
    X_train, y_train = splits["X_train"], splits["y_train"]
    X_val, y_val = splits["X_val"], splits["y_val"]
    X_test, y_test = splits["X_test"], splits["y_test"]

    print(f"[train] Sequences - Train: {X_train.shape}, Val: {X_val.shape}, Test: {X_test.shape}")

    # 3. Model construction
    model = build_cottoncast_model(
        input_shape=(60, len(FEATURE_COLUMNS)),
        lstm_units=[128, 64, 32],
        dropout_rate=0.2,
    )

    # 4. Training callbacks
    callbacks = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-5, verbose=1),
    ]

    # 5. Fit
    print("[train] Training LSTM network with Huber loss...")
    model.fit(
        X_train,
        y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1,
    )

    # 6. Save model.keras
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    model_path = os.path.join(ARTIFACTS_DIR, "model.keras")
    model.save(model_path)
    print(f"[train] Saved model to {model_path}")

    # 7. Evaluate on out-of-sample test set
    y_test_pred_scaled = model.predict(X_test, verbose=0)
    target_scaler = splits["target_scaler"]
    y_test_true = target_scaler.inverse_transform(y_test)
    y_test_pred = target_scaler.inverse_transform(y_test_pred_scaled)

    # Test dates
    test_dates = splits["test_df"].index[60:]
    run_walk_forward_evaluation(
        y_test_true,
        y_test_pred,
        test_dates,
        y_train_close=splits["train_df"]["Close"].values,
    )

    # 8. Run 90-day MC dropout forecast
    run_mc_dropout_forecast(
        df=feat_df,
        model=model,
        feature_scaler=splits["feature_scaler"],
        target_scaler=target_scaler,
        horizon_days=90,
        mc_passes=100,
    )

    # 9. Export history.json
    export_history_json(feat_df)

    print("[train] All artifacts successfully generated in:", ARTIFACTS_DIR)


if __name__ == "__main__":
    run_full_training(epochs=5, batch_size=64)
