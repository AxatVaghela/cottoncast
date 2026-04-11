"""
cottoncast/api/main.py - Production FastAPI Service for CottonCast
Serves high-performance cached endpoints for health, history, 90-day forecast,
indicators, backtest evaluation, and metrics.
Docker-ready for Hugging Face Spaces (port 7860).
"""

import os
import json
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Determine artifacts directory
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ARTIFACTS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "ml", "artifacts"))

app = FastAPI(
    title="CottonCast API",
    description="Quantitative Cotton Futures (CT=F) Deep LSTM Forecasting Service",
    version="1.0.0",
)

# CORS setup
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN] if FRONTEND_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory response cache with TTL
_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 300  # 5 minutes


def get_cached_json(filename: str) -> Dict[str, Any]:
    now = time.time()
    if filename in _CACHE and (now - _CACHE[filename]["ts"]) < CACHE_TTL:
        return _CACHE[filename]["data"]

    filepath = os.path.join(ARTIFACTS_DIR, filename)
    if not os.path.exists(filepath):
        # Fallback if artifact generated in sibling directory
        alt_path = os.path.join(BASE_DIR, "artifacts", filename)
        if os.path.exists(alt_path):
            filepath = alt_path
        else:
            raise HTTPException(status_code=404, detail=f"Artifact {filename} not yet generated.")

    with open(filepath, "r") as f:
        data = json.load(f)

    _CACHE[filename] = {"ts": now, "data": data}
    return data


# Pydantic Response Schemas
class HealthResponse(BaseModel):
    status: str
    version: str
    service: str
    uptime_seconds: float
    artifacts_ready: bool


class ForecastResponse(BaseModel):
    dates: List[str]
    expected_price: List[float]
    ci_95_upper: List[float]
    ci_95_lower: List[float]
    ci_50_upper: List[float]
    ci_50_lower: List[float]
    initial_price: float
    final_projected_price: float
    projected_change_pct: float
    horizon_days: int
    mc_passes: int


START_TIME = time.time()


@app.get("/api/health", response_model=HealthResponse)
def get_health():
    """Health check endpoint for container uptime and readiness probes."""
    forecast_exists = os.path.exists(os.path.join(ARTIFACTS_DIR, "forecast.json"))
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "cottoncast-api",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "artifacts_ready": forecast_exists,
    }


@app.get("/api/forecast")
def get_forecast():
    """Returns 90-day autoregressive expected price trajectory and MC dropout confidence bands."""
    return get_cached_json("forecast.json")


@app.get("/api/history")
def get_history(range: str = Query("1Y", pattern="^(3M|1Y|5Y|MAX)$")):
    """Returns historical daily OHLCV and technical indicators for chart inspection."""
    full_history = get_cached_json("history.json")
    n_days = {
        "3M": 65,
        "1Y": 252,
        "5Y": 1260,
        "MAX": len(full_history["dates"]),
    }.get(range, 252)

    return {
        "dates": full_history["dates"][-n_days:],
        "open": full_history["open"][-n_days:],
        "high": full_history["high"][-n_days:],
        "low": full_history["low"][-n_days:],
        "close": full_history["close"][-n_days:],
        "volume": full_history["volume"][-n_days:],
        "rsi_14": full_history["rsi_14"][-n_days:],
        "macd": full_history["macd"][-n_days:],
        "macd_signal": full_history["macd_signal"][-n_days:],
        "macd_hist": full_history["macd_hist"][-n_days:],
        "bb_upper": full_history["bb_upper"][-n_days:],
        "bb_middle": full_history["bb_middle"][-n_days:],
        "bb_lower": full_history["bb_lower"][-n_days:],
        "bb_bandwidth": full_history["bb_bandwidth"][-n_days:],
        "bb_pct_b": full_history["bb_pct_b"][-n_days:],
        "range_applied": range,
    }


@app.get("/api/indicators")
def get_indicators():
    """Returns the most recent calculated technical indicators snapshot."""
    hist = get_cached_json("history.json")
    return {
        "as_of": hist["dates"][-1],
        "close": hist["close"][-1],
        "rsi_14": hist["rsi_14"][-1],
        "macd": hist["macd"][-1],
        "macd_signal": hist["macd_signal"][-1],
        "macd_hist": hist["macd_hist"][-1],
        "bb_upper": hist["bb_upper"][-1],
        "bb_middle": hist["bb_middle"][-1],
        "bb_lower": hist["bb_lower"][-1],
        "bb_bandwidth": hist["bb_bandwidth"][-1],
        "bb_pct_b": hist["bb_pct_b"][-1],
    }


@app.get("/api/metrics")
def get_metrics():
    """Returns out-of-sample walk-forward test metrics and ARIMA baseline comparisons."""
    return get_cached_json("metrics.json")


@app.get("/api/backtest")
def get_backtest():
    """Returns LSTM vs ARIMA vs Actual price predictions and residuals histogram data."""
    return get_cached_json("backtest.json")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))  # 7860 for HF Spaces
    print(f"Starting CottonCast FastAPI server on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
