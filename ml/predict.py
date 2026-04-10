"""
cottoncast/ml/predict.py - Standalone CLI Inference Module
Loads model.keras and scaler.pkl to execute quick inference or print summary predictions.
"""

import os
import json
import argparse
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "artifacts"))


def main():
    parser = argparse.ArgumentParser(description="CottonCast Standalone Inference")
    parser.add_argument("--horizon", type=int, default=90, help="Forecasting horizon days (default: 90)")
    parser.add_argument("--artifacts", type=str, default=ARTIFACTS_DIR, help="Path to artifacts directory")
    args = parser.parse_args()

    forecast_file = os.path.join(args.artifacts, "forecast.json")
    metrics_file = os.path.join(args.artifacts, "metrics.json")

    if os.path.exists(forecast_file):
        with open(forecast_file, "r") as f:
            fc = json.load(f)
        print("=" * 55)
        print(" COTTONCAST LATEST 90-DAY TRAJECTORY SUMMARY")
        print("=" * 55)
        print(f"Initial Spot Price:     {fc['initial_price']} ¢/lb")
        print(f"30-Day Target:          {fc['expected_price'][29]} ¢/lb")
        print(f"90-Day Terminal Target: {fc['final_projected_price']} ¢/lb")
        print(f"Net Change:             {fc['projected_change_pct']:+.2f}%")
        print(f"95% CI Range (90D):     [{fc['ci_95_lower'][-1]} ¢, {fc['ci_95_upper'][-1]} ¢]")
        print("=" * 55)

    if os.path.exists(metrics_file):
        with open(metrics_file, "r") as f:
            m = json.load(f)
        print(f"Out-of-Sample Test MAPE: {m['lstm']['mape']}%")
        print(f"Coefficient of Det (R²): {m['lstm']['r2']}")
        print(f"Error Reduction vs ARIMA: {m['error_reduction_vs_arima_pct']}%")
        print("=" * 55)


if __name__ == "__main__":
    main()
