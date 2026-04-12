"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  Download,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sliders,
  TrendingUp,
  Cpu,
  Layers,
  Info,
  Calendar,
  AlertCircle,
} from "lucide-react";

import {
  fetchForecast,
  fetchHistory,
  fetchMetrics,
  fetchBacktest,
  checkApiHealth,
  ForecastData,
  HistoryData,
  MetricsData,
  BacktestData,
} from "@/lib/api";

export default function DashboardPage() {
  const [range, setRange] = useState<"3M" | "1Y" | "5Y" | "MAX">("1Y");
  const [indicatorTab, setIndicatorTab] = useState<"RSI" | "MACD" | "BB">("RSI");
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [isApiLive, setIsApiLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [backtest, setBacktest] = useState<BacktestData | null>(null);

  // Initial load
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const [fcRes, histRes, metRes, btRes, healthRes] = await Promise.all([
        fetchForecast(),
        fetchHistory("1Y"),
        fetchMetrics(),
        fetchBacktest(),
        checkApiHealth(),
      ]);

      setForecast(fcRes.data);
      setHistory(histRes.data);
      setMetrics(metRes.data);
      setBacktest(btRes.data);
      setIsApiLive(healthRes.isLive);
      setLoading(false);
    }
    loadInitialData();
  }, []);

  // Update history when range changes
  const handleRangeChange = async (newRange: "3M" | "1Y" | "5Y" | "MAX") => {
    setRange(newRange);
    const histRes = await fetchHistory(newRange);
    setHistory(histRes.data);
  };

  // Ping API to wake up cold start
  const handleWakeUpServer = async () => {
    setIsWakingUp(true);
    const health = await checkApiHealth();
    setIsApiLive(health.isLive);
    if (health.isLive) {
      const [fcRes, histRes] = await Promise.all([
        fetchForecast(),
        fetchHistory(range),
      ]);
      setForecast(fcRes.data);
      setHistory(histRes.data);
    }
    setTimeout(() => setIsWakingUp(false), 1200);
  };

  // CSV Export
  const handleDownloadCSV = () => {
    if (!forecast) return;
    const headers = [
      "Date",
      "Expected_Price_Cents_per_lb",
      "CI_95_Lower",
      "CI_95_Upper",
      "CI_50_Lower",
      "CI_50_Upper",
    ];
    const rows = forecast.dates.map((date, idx) => [
      date,
      forecast.expected_price[idx],
      forecast.ci_95_lower[idx],
      forecast.ci_95_upper[idx],
      forecast.ci_50_lower[idx],
      forecast.ci_50_upper[idx],
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `cottoncast_90d_forecast_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare combined series for Main Chart: History + 90-Day Forecast
  const mainChartData = useMemo(() => {
    if (!history || !forecast) return [];

    const data: Array<{
      date: string;
      historyClose?: number;
      forecastClose?: number;
      ci95Lower?: number;
      ci95Upper?: number;
      ci50Lower?: number;
      ci50Upper?: number;
      isForecast?: boolean;
    }> = [];

    // Historical points
    const histLen = history.dates.length;
    for (let i = 0; i < histLen; i++) {
      data.push({
        date: history.dates[i],
        historyClose: history.close[i],
        isForecast: false,
      });
    }

    // Connect forecast start with last history point
    if (data.length > 0) {
      const lastHist = data[data.length - 1];
      lastHist.forecastClose = lastHist.historyClose;
      lastHist.ci95Lower = lastHist.historyClose;
      lastHist.ci95Upper = lastHist.historyClose;
    }

    // 90-Day Forecast points
    for (let i = 0; i < forecast.dates.length; i++) {
      data.push({
        date: forecast.dates[i],
        forecastClose: forecast.expected_price[i],
        ci95Lower: forecast.ci_95_lower[i],
        ci95Upper: forecast.ci_95_upper[i],
        ci50Lower: forecast.ci_50_lower[i],
        ci50Upper: forecast.ci_50_upper[i],
        isForecast: true,
      });
    }

    return data;
  }, [history, forecast]);

  // Prepare Indicator Chart Data
  const indicatorChartData = useMemo(() => {
    if (!history) return [];
    return history.dates.map((d, i) => ({
      date: d,
      close: history.close[i],
      rsi_14: history.rsi_14[i],
      macd: history.macd[i],
      macd_signal: history.macd_signal[i],
      macd_hist: history.macd_hist[i],
      bb_upper: history.bb_upper[i],
      bb_middle: history.bb_middle[i],
      bb_lower: history.bb_lower[i],
      bb_bandwidth: history.bb_bandwidth[i],
    }));
  }, [history]);

  // Prepare Backtest Chart Data (LSTM vs ARIMA vs Actual)
  const backtestChartData = useMemo(() => {
    if (!backtest) return [];
    return backtest.dates.map((d, i) => ({
      date: d,
      actual: backtest.actual[i],
      lstm: backtest.lstm_predicted[i],
      arima: backtest.arima_predicted[i],
      residual: backtest.residuals[i],
    }));
  }, [backtest]);

  // Residuals Histogram Buckets
  const residualBuckets = useMemo(() => {
    if (!backtest || !backtest.residuals.length) return [];
    const res = backtest.residuals;
    const minVal = Math.floor(Math.min(...res));
    const maxVal = Math.ceil(Math.max(...res));
    const step = 2.0;

    const buckets: Record<string, number> = {};
    for (let b = minVal; b <= maxVal; b += step) {
      buckets[`${b.toFixed(0)} to ${(b + step).toFixed(0)}`] = 0;
    }

    res.forEach((val) => {
      for (let b = minVal; b <= maxVal; b += step) {
        if (val >= b && val < b + step) {
          buckets[`${b.toFixed(0)} to ${(b + step).toFixed(0)}`]++;
          break;
        }
      }
    });

    return Object.entries(buckets).map(([rangeLabel, count]) => ({
      range: rangeLabel,
      count,
    }));
  }, [backtest]);

  // Latest snapshot metrics
  const currentPrice = history ? history.close[history.close.length - 1] : 68.5;
  const initialPrice = forecast ? forecast.initial_price : currentPrice;
  const projectedPrice = forecast ? forecast.final_projected_price : 74.2;
  const projectedPct = forecast ? forecast.projected_change_pct : 8.32;
  const isUp = projectedPct >= 0;
  const todayDate = history ? history.dates[history.dates.length - 1] : "Today";

  return (
    <div className="min-h-screen bg-[#0E1512] text-[#E7EFE9] flex flex-col font-sans selection:bg-[#5FD38D]/20 selection:text-[#5FD38D]">
      <Navbar variant="dark" />

      {/* Main Terminal Header Bar */}
      <section className="border-b border-[#24332B] bg-[#16201B]/70 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F3D2B] border border-[#24332B] flex items-center justify-center font-mono font-bold text-[#F2C94C] text-sm">
              CT=F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-lg font-bold text-[#E7EFE9] tracking-tight">
                  ICE Cotton No. 2 Futures
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1F3D2B] text-[#5FD38D] border border-[#24332B]">
                  US Cents / lb
                </span>
              </div>
              <div className="text-xs font-mono text-[#8FB8A0] flex items-center gap-2 mt-0.5">
                <span>Settlement Date: {todayDate}</span>
                <span>•</span>
                <span>Continuous Contract Daily</span>
              </div>
            </div>
          </div>

          {/* Status and Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live / Cached State Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E1512] border border-[#24332B] text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isApiLive ? "bg-[#5FD38D] animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="text-[#8FB8A0]">
                {isApiLive ? "Live Cloud API" : "FastAPI Neural Cache"}
              </span>
              <button
                onClick={handleWakeUpServer}
                title="Ping server status"
                className="ml-1 text-[#8FB8A0] hover:text-[#5FD38D] transition-colors"
                disabled={isWakingUp}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isWakingUp ? "animate-spin text-[#5FD38D]" : ""}`}
                />
              </button>
            </div>

            {/* CSV Export Button */}
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-1.5 rounded-lg bg-[#1F3D2B] hover:bg-[#254934] border border-[#24332B] text-xs font-mono font-semibold text-[#E7EFE9] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#F2C94C]" />
              Export 90D CSV
            </button>
          </div>
        </div>
      </section>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cards Row */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Current Spot */}
          <div className="p-4 rounded-xl bg-[#16201B] border border-[#24332B] flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#8FB8A0] uppercase tracking-wider">
              Spot Price
            </span>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#E7EFE9]">
                {currentPrice.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-[#8FB8A0] ml-1">¢/lb</span>
            </div>
            <span className="text-[10px] font-mono text-[#8FB8A0]">
              As of {todayDate}
            </span>
          </div>

          {/* Card 2: 90D Projected Price */}
          <div className="p-4 rounded-xl bg-[#16201B] border border-[#24332B] flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#F2C94C] uppercase tracking-wider flex items-center gap-1">
              <span>90D Target</span>
            </span>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#F2C94C]">
                {projectedPrice.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-[#F2C94C] ml-1">¢/lb</span>
            </div>
            <span className="text-[10px] font-mono text-[#8FB8A0]">
              Terminal Point (T+90)
            </span>
          </div>

          {/* Card 3: Projected % Return */}
          <div className="p-4 rounded-xl bg-[#16201B] border border-[#24332B] flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#8FB8A0] uppercase tracking-wider">
              Projected Change
            </span>
            <div className="my-1 flex items-baseline gap-1">
              <span
                className={`text-2xl sm:text-3xl font-mono font-bold ${
                  isUp ? "text-[#5FD38D]" : "text-[#E5675B]"
                }`}
              >
                {isUp ? "+" : ""}
                {projectedPct.toFixed(2)}%
              </span>
              {isUp ? (
                <ArrowUpRight className="w-5 h-5 text-[#5FD38D]" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-[#E5675B]" />
              )}
            </div>
            <span className="text-[10px] font-mono text-[#8FB8A0]">
              Trajectory vs Spot
            </span>
          </div>

          {/* Card 4: Model Test MAPE */}
          <div className="p-4 rounded-xl bg-[#16201B] border border-[#24332B] flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#8FB8A0] uppercase tracking-wider">
              Out-of-Sample MAPE
            </span>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#E7EFE9]">
                {metrics ? `${metrics.lstm.mape}%` : "16.7%"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#5FD38D]">
              Strict Test Window
            </span>
          </div>

          {/* Card 5: Coefficient of Det R² */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-[#16201B] border border-[#24332B] flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#8FB8A0] uppercase tracking-wider">
              Model Fit (R²)
            </span>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#E7EFE9]">
                {metrics ? metrics.lstm.r2 : "0.253"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8FB8A0]">
              Vs Mean Benchmark
            </span>
          </div>
        </section>

        {/* Main Chart Module: History + 90-Day Forecast + MC Dropout Band */}
        <section className="p-5 rounded-2xl bg-[#16201B] border border-[#24332B] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#24332B] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-base font-bold text-[#E7EFE9]">
                  Historical Price & 90-Day Autoregressive Trajectory
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#24332B] text-[#F2C94C]">
                  100 MC Dropout Passes
                </span>
              </div>
              <p className="text-xs text-[#8FB8A0] font-mono">
                Line chart with 90% confidence intervals (5th–95th percentile) and &quot;Today&quot; horizon divider.
              </p>
            </div>

            {/* Range Selector Toggles */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0E1512] border border-[#24332B]">
              {(["3M", "1Y", "5Y", "MAX"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRangeChange(r)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                    range === r
                      ? "bg-[#1F3D2B] text-[#5FD38D] border border-[#24332B]"
                      : "text-[#8FB8A0] hover:text-[#E7EFE9]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-[380px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Shaded Confidence Band */}
                  <linearGradient id="bandColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F2C94C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F2C94C" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#24332B" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  stroke="#8FB8A0"
                  fontSize={11}
                  tickLine={false}
                  minTickGap={35}
                  fontFamily="var(--font-jetbrains-mono)"
                />
                <YAxis
                  stroke="#8FB8A0"
                  fontSize={11}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  fontFamily="var(--font-jetbrains-mono)"
                  unit="¢"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-3 rounded-lg bg-[#0E1512] border border-[#24332B] shadow-xl text-xs font-mono space-y-1">
                          <div className="text-[#8FB8A0] font-semibold border-b border-[#24332B] pb-1">
                            {label} {item.isForecast ? "(Forecast)" : "(Historical)"}
                          </div>
                          {item.historyClose && (
                            <div className="text-[#8FB8A0] flex justify-between gap-4">
                              <span>Actual Settlement:</span>
                              <span className="font-bold text-[#E7EFE9]">{item.historyClose.toFixed(2)} ¢</span>
                            </div>
                          )}
                          {item.forecastClose && (
                            <div className="text-[#F2C94C] flex justify-between gap-4">
                              <span>LSTM Expected Target:</span>
                              <span className="font-bold">{item.forecastClose.toFixed(2)} ¢</span>
                            </div>
                          )}
                          {item.ci95Lower && item.ci95Upper && (
                            <div className="text-[#8FB8A0] text-[10px] pt-1">
                              95% CI: [{item.ci95Lower.toFixed(2)} ¢ — {item.ci95Upper.toFixed(2)} ¢]
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Horizon divider at today */}
                <ReferenceLine
                  x={todayDate}
                  stroke="#E8B04B"
                  strokeDasharray="4 4"
                  label={{
                    value: "TODAY / PROJECTION",
                    position: "top",
                    fill: "#E8B04B",
                    fontSize: 10,
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                />

                {/* Shaded Uncertainty Area */}
                <Area
                  type="monotone"
                  dataKey="ci95Upper"
                  stroke="transparent"
                  fill="url(#bandColor)"
                  connectNulls
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="ci95Lower"
                  stroke="transparent"
                  fill="#16201B"
                  connectNulls
                  isAnimationActive={false}
                />

                {/* Historical Series Stroke */}
                <Line
                  type="monotone"
                  dataKey="historyClose"
                  stroke="#8FB8A0"
                  strokeWidth={2}
                  dot={false}
                  name="Historical Close"
                  connectNulls
                />

                {/* 90-Day Forecast Expected Price */}
                <Line
                  type="monotone"
                  dataKey="forecastClose"
                  stroke="#F2C94C"
                  strokeWidth={2.5}
                  dot={false}
                  name="LSTM Projected"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Tabbed Technical Indicator Panels */}
        <section className="p-5 rounded-2xl bg-[#16201B] border border-[#24332B] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#24332B] pb-4">
            <div>
              <h3 className="font-mono text-base font-bold text-[#E7EFE9]">
                Vectorized Technical Indicators Engine
              </h3>
              <p className="text-xs text-[#8FB8A0] font-mono">
                Dynamically computed across historical sessions and fed back recursively during roll-forward.
              </p>
            </div>

            {/* Indicator Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0E1512] border border-[#24332B]">
              <button
                onClick={() => setIndicatorTab("RSI")}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  indicatorTab === "RSI"
                    ? "bg-[#1F3D2B] text-[#5FD38D]"
                    : "text-[#8FB8A0] hover:text-[#E7EFE9]"
                }`}
              >
                RSI (14)
              </button>
              <button
                onClick={() => setIndicatorTab("MACD")}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  indicatorTab === "MACD"
                    ? "bg-[#1F3D2B] text-[#5FD38D]"
                    : "text-[#8FB8A0] hover:text-[#E7EFE9]"
                }`}
              >
                MACD (12,26,9)
              </button>
              <button
                onClick={() => setIndicatorTab("BB")}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  indicatorTab === "BB"
                    ? "bg-[#1F3D2B] text-[#5FD38D]"
                    : "text-[#8FB8A0] hover:text-[#E7EFE9]"
                }`}
              >
                Bollinger Bands (20,2)
              </button>
            </div>
          </div>

          {/* Indicator Visualizer */}
          <div className="h-[240px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {indicatorTab === "RSI" ? (
                <LineChart data={indicatorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#24332B" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#8FB8A0" fontSize={10} minTickGap={35} fontFamily="var(--font-jetbrains-mono)" />
                  <YAxis domain={[0, 100]} stroke="#8FB8A0" fontSize={10} fontFamily="var(--font-jetbrains-mono)" />
                  <Tooltip contentStyle={{ backgroundColor: "#0E1512", borderColor: "#24332B", fontSize: 12, fontFamily: "var(--font-jetbrains-mono)" }} />
                  <ReferenceLine y={70} stroke="#E5675B" strokeDasharray="3 3" label={{ value: "Overbought (70)", fill: "#E5675B", fontSize: 10 }} />
                  <ReferenceLine y={30} stroke="#5FD38D" strokeDasharray="3 3" label={{ value: "Oversold (30)", fill: "#5FD38D", fontSize: 10 }} />
                  <Line type="monotone" dataKey="rsi_14" stroke="#F2C94C" strokeWidth={1.8} dot={false} name="RSI 14" />
                </LineChart>
              ) : indicatorTab === "MACD" ? (
                <BarChart data={indicatorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#24332B" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#8FB8A0" fontSize={10} minTickGap={35} fontFamily="var(--font-jetbrains-mono)" />
                  <YAxis stroke="#8FB8A0" fontSize={10} fontFamily="var(--font-jetbrains-mono)" />
                  <Tooltip contentStyle={{ backgroundColor: "#0E1512", borderColor: "#24332B", fontSize: 12, fontFamily: "var(--font-jetbrains-mono)" }} />
                  <ReferenceLine y={0} stroke="#24332B" />
                  <Bar dataKey="macd_hist" fill="#5FD38D" name="Histogram" />
                </BarChart>
              ) : (
                <LineChart data={indicatorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#24332B" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#8FB8A0" fontSize={10} minTickGap={35} fontFamily="var(--font-jetbrains-mono)" />
                  <YAxis stroke="#8FB8A0" fontSize={10} domain={["auto", "auto"]} fontFamily="var(--font-jetbrains-mono)" />
                  <Tooltip contentStyle={{ backgroundColor: "#0E1512", borderColor: "#24332B", fontSize: 12, fontFamily: "var(--font-jetbrains-mono)" }} />
                  <Line type="monotone" dataKey="bb_upper" stroke="#E5675B" strokeDasharray="2 2" dot={false} name="Upper Band" />
                  <Line type="monotone" dataKey="bb_middle" stroke="#5FD38D" dot={false} name="Middle (SMA 20)" />
                  <Line type="monotone" dataKey="bb_lower" stroke="#8FB8A0" strokeDasharray="2 2" dot={false} name="Lower Band" />
                  <Line type="monotone" dataKey="close" stroke="#E7EFE9" strokeWidth={1.5} dot={false} name="Close" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Backtest & Evaluation Module: LSTM vs ARIMA vs Actual + Residuals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Out-of-sample Backtest Chart */}
          <section className="lg:col-span-8 p-5 rounded-2xl bg-[#16201B] border border-[#24332B] space-y-4">
            <div className="flex items-center justify-between border-b border-[#24332B] pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-[#E7EFE9] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#5FD38D]" />
                  Walk-Forward Backtest (LSTM vs ARIMA vs Actual)
                </h3>
                <p className="text-[11px] font-mono text-[#8FB8A0]">
                  Unseen out-of-sample test partition (last 120 sessions).
                </p>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backtestChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#24332B" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#8FB8A0" fontSize={10} minTickGap={30} fontFamily="var(--font-jetbrains-mono)" />
                  <YAxis stroke="#8FB8A0" fontSize={10} domain={["auto", "auto"]} fontFamily="var(--font-jetbrains-mono)" />
                  <Tooltip contentStyle={{ backgroundColor: "#0E1512", borderColor: "#24332B", fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" }} />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" }} />
                  <Line type="monotone" dataKey="actual" stroke="#E7EFE9" strokeWidth={2} dot={false} name="Actual Close" />
                  <Line type="monotone" dataKey="lstm" stroke="#F2C94C" strokeWidth={2} dot={false} name="LSTM + Attention" />
                  <Line type="monotone" dataKey="arima" stroke="#8FB8A0" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="ARIMA Baseline" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Residuals Histogram & Commentary Card */}
          <section className="lg:col-span-4 p-5 rounded-2xl bg-[#16201B] border border-[#24332B] flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-mono text-sm font-bold text-[#E7EFE9] mb-1">
                Residuals Distribution
              </h3>
              <p className="text-[11px] font-mono text-[#8FB8A0]">
                Prediction errors ($y_{'{true}'} - y_{'{lstm}'}$).
              </p>

              <div className="h-[140px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={residualBuckets} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#24332B" opacity={0.4} />
                    <XAxis dataKey="range" stroke="#8FB8A0" fontSize={8} tick={false} />
                    <YAxis stroke="#8FB8A0" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: "#0E1512", borderColor: "#24332B", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }} />
                    <Bar dataKey="count" fill="#5FD38D" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Commentary Callout */}
            <div className="p-3 rounded-lg bg-[#0E1512] border border-[#24332B] text-[11px] font-mono leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-[#F2C94C] font-bold">
                <Info className="w-3.5 h-3.5" />
                <span>Empirical Market Efficiency Note</span>
              </div>
              <p className="text-[#8FB8A0]">
                Directional accuracy near 50% is mathematically consistent with Eugene Fama&apos;s Weak-Form EMH for liquid futures.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer variant="dark" />
    </div>
  );
}
