/**
 * CottonCast API Client
 * Seamlessly interfaces with the FastAPI Hugging Face Space endpoint
 * with intelligent fallback to precomputed bundled artifacts if sleeping.
 */

import fallbackForecast from "@/data/forecast.json";
import fallbackHistory from "@/data/history.json";
import fallbackMetrics from "@/data/metrics.json";
import fallbackBacktest from "@/data/backtest.json";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:7860";

export interface ForecastData {
  dates: string[];
  expected_price: number[];
  ci_95_upper: number[];
  ci_95_lower: number[];
  ci_50_upper: number[];
  ci_50_lower: number[];
  initial_price: number;
  final_projected_price: number;
  projected_change_pct: number;
  horizon_days: number;
  mc_passes: number;
}

export interface HistoryData {
  dates: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  log_return?: number[];
  rsi_14: number[];
  macd: number[];
  macd_signal: number[];
  macd_hist: number[];
  bb_upper: number[];
  bb_middle: number[];
  bb_lower: number[];
  bb_bandwidth: number[];
  bb_pct_b: number[];
  updated_at?: string;
  range_applied?: string;
}

export interface MetricsData {
  model: string;
  target_ticker: string;
  evaluation_partition: string;
  lstm: {
    mape: number;
    rmse: number;
    r2: number;
    directional_accuracy_pct: number;
  };
  arima_baseline: {
    model_type: string;
    mape: number;
    rmse: number;
    r2: number;
    directional_accuracy_pct: number;
  };
  error_reduction_vs_arima_pct: number;
  commentary: string;
}

export interface BacktestData {
  dates: string[];
  actual: number[];
  lstm_predicted: number[];
  arima_predicted: number[];
  residuals: number[];
}

export interface HealthData {
  status: string;
  version: string;
  service: string;
  uptime_seconds: number;
  artifacts_ready: boolean;
}

export async function checkApiHealth(): Promise<{ isLive: boolean; data?: HealthData }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    if (!res.ok) return { isLive: false };
    const data = await res.json();
    return { isLive: true, data };
  } catch {
    return { isLive: false };
  }
}

export async function fetchForecast(): Promise<{ data: ForecastData; isLive: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE_URL}/api/forecast`, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { data, isLive: true };
    }
  } catch (e) {
    console.warn("[api] Using fallback forecast payload:", e);
  }
  return { data: fallbackForecast as ForecastData, isLive: false };
}

export async function fetchHistory(range: "3M" | "1Y" | "5Y" | "MAX" = "1Y"): Promise<{ data: HistoryData; isLive: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE_URL}/api/history?range=${range}`, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { data, isLive: true };
    }
  } catch (e) {
    console.warn("[api] Using fallback history payload:", e);
  }

  // Filter fallback history according to range
  const full = fallbackHistory as HistoryData;
  const nDays = range === "3M" ? 65 : range === "1Y" ? 252 : range === "5Y" ? 1260 : full.dates.length;
  const sliced: HistoryData = {
    dates: full.dates.slice(-nDays),
    open: full.open.slice(-nDays),
    high: full.high.slice(-nDays),
    low: full.low.slice(-nDays),
    close: full.close.slice(-nDays),
    volume: full.volume.slice(-nDays),
    rsi_14: full.rsi_14.slice(-nDays),
    macd: full.macd.slice(-nDays),
    macd_signal: full.macd_signal.slice(-nDays),
    macd_hist: full.macd_hist.slice(-nDays),
    bb_upper: full.bb_upper.slice(-nDays),
    bb_middle: full.bb_middle.slice(-nDays),
    bb_lower: full.bb_lower.slice(-nDays),
    bb_bandwidth: full.bb_bandwidth.slice(-nDays),
    bb_pct_b: full.bb_pct_b.slice(-nDays),
    range_applied: range,
    updated_at: full.updated_at,
  };
  return { data: sliced, isLive: false };
}

export async function fetchMetrics(): Promise<{ data: MetricsData; isLive: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE_URL}/api/metrics`, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { data, isLive: true };
    }
  } catch (e) {
    console.warn("[api] Using fallback metrics payload:", e);
  }
  return { data: fallbackMetrics as MetricsData, isLive: false };
}

export async function fetchBacktest(): Promise<{ data: BacktestData; isLive: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE_URL}/api/backtest`, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { data, isLive: true };
    }
  } catch (e) {
    console.warn("[api] Using fallback backtest payload:", e);
  }
  return { data: fallbackBacktest as BacktestData, isLive: false };
}
