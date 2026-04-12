import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Compass,
  LineChart,
} from "lucide-react";

import forecastData from "@/data/forecast.json";
import metricsData from "@/data/metrics.json";
import historyData from "@/data/history.json";

export default function LandingPage() {
  const currentSpot = historyData.close[historyData.close.length - 1];
  const target90D = forecastData.final_projected_price;
  const projectedChange = forecastData.projected_change_pct;
  const isPositive = projectedChange >= 0;

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#1B2A21] flex flex-col font-sans selection:bg-[#E8B04B]/20 selection:text-[#1F3D2B]">
      <Navbar variant="light" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Soft Organic Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CFE3D3]/40 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-[#E8B04B]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Ticker Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#CFE3D3] shadow-xs text-xs font-mono mb-8">
            <span className="w-2 h-2 rounded-full bg-[#1F3D2B] animate-pulse" />
            <span className="font-semibold text-[#1F3D2B]">ICE Cotton No. 2 (`CT=F`)</span>
            <span className="text-[#1B2A21]/50">•</span>
            <span className="text-[#1F3D2B] font-bold">{currentSpot.toFixed(2)} ¢/lb</span>
            <span
              className={`font-semibold ${
                isPositive ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {isPositive ? "+" : ""}
              {projectedChange}% (90D Horizon)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Editorial Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1B2A21] leading-[1.12]">
                Cotton Price Prediction Using{" "}
                <span className="italic font-normal text-[#1F3D2B]">
                  Deep LSTM Networks
                </span>{" "}
                with Bahdanau Attention.
              </h1>

              <p className="text-lg text-[#1B2A21]/80 leading-relaxed max-w-2xl font-normal">
                CottonCast bridges agricultural commodity econometrics and modern deep sequence modeling.
                By synthesizing multi-scale momentum indicators, zero-leakage chronological training, and
                100-pass Monte Carlo dropout, we deliver probabilistic 90-day trajectories with calibrated confidence intervals.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-xl bg-[#1F3D2B] hover:bg-[#15291d] text-[#F7F3EA] font-semibold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <LineChart className="w-4 h-4 text-[#E8B04B]" />
                  Launch Quantitative Terminal
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/model"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#CFE3D3]/40 border border-[#CFE3D3] text-[#1B2A21] font-semibold text-sm flex items-center gap-2 transition-all shadow-xs"
                >
                  <Cpu className="w-4 h-4 text-[#1F3D2B]" />
                  Methodology & Metrics
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#CFE3D3]/60 max-w-lg">
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#1F3D2B]">
                    {metricsData.lstm.mape}%
                  </div>
                  <div className="text-xs text-[#1B2A21]/70 font-medium">Out-of-Sample MAPE</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#1F3D2B]">
                    100 Passes
                  </div>
                  <div className="text-xs text-[#1B2A21]/70 font-medium">MC Dropout Uncertainty</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#1F3D2B]">
                    70/15/15
                  </div>
                  <div className="text-xs text-[#1B2A21]/70 font-medium">Zero-Leakage Split</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Terminal Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0E1512] border border-[#24332B] shadow-2xl p-6 text-[#E7EFE9] space-y-5">
                {/* Terminal Card Header */}
                <div className="flex items-center justify-between border-b border-[#24332B] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="font-mono text-xs text-[#8FB8A0] ml-2">COTTONCAST_CORE_V1</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#16201B] border border-[#24332B] px-2 py-0.5 rounded text-[#F2C94C]">
                    90D Roll-Forward
                  </span>
                </div>

                {/* Spot vs Projected Trajectory Box */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-[#16201B] border border-[#24332B]">
                    <div className="text-[10px] text-[#8FB8A0] uppercase">Latest Spot Close</div>
                    <div className="text-xl font-bold text-[#E7EFE9] mt-0.5">
                      {currentSpot.toFixed(2)} <span className="text-xs font-normal">¢/lb</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#16201B] border border-[#24332B]">
                    <div className="text-[10px] text-[#F2C94C] uppercase">90D LSTM Target</div>
                    <div className="text-xl font-bold text-[#F2C94C] mt-0.5">
                      {target90D.toFixed(2)} <span className="text-xs font-normal">¢/lb</span>
                    </div>
                  </div>
                </div>

                {/* Trajectory Highlights */}
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#24332B]/60">
                    <span className="text-[#8FB8A0]">Projected Trajectory:</span>
                    <span className={isPositive ? "text-[#5FD38D] font-bold" : "text-[#E5675B] font-bold"}>
                      {isPositive ? "+" : ""}
                      {projectedChange}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#24332B]/60">
                    <span className="text-[#8FB8A0]">95% Confidence Band:</span>
                    <span className="text-[#E7EFE9]">
                      [{forecastData.ci_95_lower[forecastData.ci_95_lower.length - 1]} ¢ — {forecastData.ci_95_upper[forecastData.ci_95_upper.length - 1]} ¢]
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#24332B]/60">
                    <span className="text-[#8FB8A0]">Attention Energy Peak:</span>
                    <span className="text-[#5FD38D]">Harvest Seasonal Surge</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[#8FB8A0]">Walk-Forward Partition:</span>
                    <span className="text-[#E7EFE9]">Strict Unseen Future Split</span>
                  </div>
                </div>

                {/* CTA Link inside preview */}
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 rounded-lg bg-[#5FD38D] hover:bg-[#4dc77d] text-[#0E1512] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  Open Interactive Visualizer
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Quantitative Excellence */}
      <section className="py-16 bg-[#CFE3D3]/20 border-y border-[#CFE3D3]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold text-[#1F3D2B]">
              Rigorous Quantitative Foundations
            </h2>
            <p className="text-sm text-[#1B2A21]/75 mt-2">
              Designed from first principles to overcome financial data leakage, non-stationarity, and volatility regime shifts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#CFE3D3] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#1F3D2B] text-[#E8B04B] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">
                3-Layer Stacked LSTM
              </h3>
              <p className="text-xs text-[#1B2A21]/75 leading-relaxed">
                Deep recurrent architecture (128 → 64 → 32 cells) with 0.2 dropout captures short-term momentum and multi-month commodity cycles.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#CFE3D3] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#1F3D2B] text-[#E8B04B] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">
                Bahdanau Attention
              </h3>
              <p className="text-xs text-[#1B2A21]/75 leading-relaxed">
                Dynamic alignment scoring identifies critical historical shock windows (weather events, export embargoes) across the 60-day memory buffer.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#CFE3D3] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#1F3D2B] text-[#E8B04B] flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">
                Zero Data Leakage
              </h3>
              <p className="text-xs text-[#1B2A21]/75 leading-relaxed">
                Strict chronological 70/15/15 partition. RobustScalers fit exclusively on train data, ensuring genuinely unseen future test evaluation.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#CFE3D3] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#1F3D2B] text-[#E8B04B] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">
                100-Pass MC Dropout
              </h3>
              <p className="text-xs text-[#1B2A21]/75 leading-relaxed">
                Stochastic inference during production generates empirical 5th to 95th percentile confidence bands, rejecting false deterministic certainty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fama Weak-Form EMH Commentary Callout */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-white border-2 border-[#1F3D2B]/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-[#1F3D2B]">
            <Compass className="w-5 h-5 text-[#E8B04B]" />
            <h3 className="font-serif font-bold text-xl">
              Market Efficiency & Honest Metrics Disclosure
            </h3>
          </div>
          <p className="text-sm text-[#1B2A21]/80 leading-relaxed">
            In liquid financial futures markets, Eugene Fama&apos;s <strong>Weak-Form Efficient Market Hypothesis (EMH)</strong> establishes that asset prices incorporate all past trading information. A model claiming 80%+ daily directional accuracy on liquid futures is almost invariably suffering from target leakage or lookahead bias.
          </p>
          <div className="p-4 rounded-lg bg-[#F7F3EA] border border-[#CFE3D3] text-xs font-mono text-[#1F3D2B] space-y-1">
            <div className="font-semibold text-sm">Empirical Backtest Findings:</div>
            <div>• Measured Out-of-Sample Directional Accuracy: <strong>{metricsData.lstm.directional_accuracy_pct}%</strong> (statistically consistent with EMH)</div>
            <div>• Mean Absolute Percentage Error (MAPE): <strong>{metricsData.lstm.mape}%</strong></div>
            <div>• Coefficient of Determination (R²): <strong>{metricsData.lstm.r2}</strong></div>
            <div>• The LSTM&apos;s value lies in capturing <strong>volatility clustering, regime boundaries, and non-linear multi-month mean-reversion</strong>.</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[#1F3D2B] text-[#F7F3EA] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Explore the Real-Time Terminal & Forecast Trajectory
          </h2>
          <p className="text-[#CFE3D3] text-sm max-w-xl mx-auto">
            Interact with live technical indicators (RSI, MACD, Bollinger Bands), inspect out-of-sample backtests, and export the complete 90-day trajectory.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#E8B04B] hover:bg-[#d49e39] text-[#1B2A21] font-bold text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Access Analytics Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
