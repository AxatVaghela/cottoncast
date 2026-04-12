import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Layers,
  ShieldCheck,
  Cpu,
  BarChart2,
  AlertTriangle,
  Compass,
  ArrowRight,
  GitBranch,
  CheckCircle,
} from "lucide-react";

import metricsData from "@/data/metrics.json";

export default function MethodologyPage() {
  const lstm = metricsData.lstm;
  const arima = metricsData.arima_baseline;

  return (
    <div className="min-h-screen bg-[#0E1512] text-[#E7EFE9] flex flex-col font-sans selection:bg-[#5FD38D]/20 selection:text-[#5FD38D]">
      <Navbar variant="dark" />

      {/* Header Banner */}
      <section className="border-b border-[#24332B] bg-[#16201B]/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F3D2B] border border-[#24332B] text-xs font-mono text-[#5FD38D]">
            <Cpu className="w-3.5 h-3.5" />
            <span>QUANTITATIVE NEURAL ARCHITECTURE</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#E7EFE9]">
            Methodology & Econometric Verification
          </h1>
          <p className="text-base text-[#8FB8A0] font-mono leading-relaxed max-w-3xl">
            A deep dive into CottonCast&apos;s 3-layer stacked LSTM network with Bahdanau attention,
            zero-leakage chronological training protocol, and walk-forward benchmark against classical ARIMA baselines.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Section 1: Architecture Visualizer */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#16201B] border border-[#24332B] space-y-6">
          <div className="flex items-center gap-3 border-b border-[#24332B] pb-4">
            <Layers className="w-6 h-6 text-[#F2C94C]" />
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#E7EFE9]">
                Neural Network Architecture
              </h2>
              <p className="text-xs font-mono text-[#8FB8A0]">
                Sequential information flow across stacked recurrence and additive attention.
              </p>
            </div>
          </div>

          {/* Interactive Visual Architecture Pipeline Flow */}
          <div className="space-y-4 font-mono">
            {/* Step 1: Input Tensor */}
            <div className="p-4 rounded-xl bg-[#0E1512] border border-[#24332B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#1F3D2B] text-[#5FD38D] text-xs flex items-center justify-center font-bold">
                  01
                </span>
                <div>
                  <div className="font-bold text-sm text-[#E7EFE9]">Sequential Feature Input Tensor</div>
                  <div className="text-xs text-[#8FB8A0]">60-day historical window × 12 technical features</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#F2C94C] bg-[#16201B] px-3 py-1 rounded border border-[#24332B]">
                Shape: (Batch, 60, 12)
              </span>
            </div>

            {/* Step 2: Stacked LSTM Layers */}
            <div className="p-4 rounded-xl bg-[#0E1512] border border-[#24332B] space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#1F3D2B] text-[#5FD38D] text-xs flex items-center justify-center font-bold">
                  02
                </span>
                <div>
                  <div className="font-bold text-sm text-[#E7EFE9]">3 Stacked LSTM Layers with Dropout</div>
                  <div className="text-xs text-[#8FB8A0]">Hierarchical temporal abstraction with 0.2 variational dropout</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded bg-[#16201B] border border-[#24332B]">
                  <div className="text-[#8FB8A0]">Layer 1: LSTM</div>
                  <div className="font-bold text-[#5FD38D]">128 units (Return Seq)</div>
                </div>
                <div className="p-2.5 rounded bg-[#16201B] border border-[#24332B]">
                  <div className="text-[#8FB8A0]">Layer 2: LSTM</div>
                  <div className="font-bold text-[#5FD38D]">64 units (Return Seq)</div>
                </div>
                <div className="p-2.5 rounded bg-[#16201B] border border-[#24332B]">
                  <div className="text-[#8FB8A0]">Layer 3: LSTM</div>
                  <div className="font-bold text-[#5FD38D]">32 units (Return Seq)</div>
                </div>
              </div>
            </div>

            {/* Step 3: Bahdanau Attention */}
            <div className="p-4 rounded-xl bg-[#0E1512] border border-[#24332B] space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#1F3D2B] text-[#F2C94C] text-xs flex items-center justify-center font-bold">
                  03
                </span>
                <div>
                  <div className="font-bold text-sm text-[#E7EFE9]">Bahdanau (Additive) Attention Layer</div>
                  <div className="text-xs text-[#8FB8A0]">Learned dynamic weights across all 60 time steps</div>
                </div>
              </div>
              <div className="p-3 rounded bg-[#16201B] border border-[#24332B] text-xs space-y-1.5 text-[#8FB8A0]">
                <div>Alignment Score: <code className="text-[#E7EFE9]">e_t = v^T tanh(W h_t + b)</code></div>
                <div>Attention Weights: <code className="text-[#E7EFE9]">α_t = softmax(e_t)</code></div>
                <div>Context Vector: <code className="text-[#F2C94C]">c = Σ α_t h_t</code> (Collapses sequence to rich 32-dim vector)</div>
              </div>
            </div>

            {/* Step 4: Projection Head */}
            <div className="p-4 rounded-xl bg-[#0E1512] border border-[#24332B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#1F3D2B] text-[#5FD38D] text-xs flex items-center justify-center font-bold">
                  04
                </span>
                <div>
                  <div className="font-bold text-sm text-[#E7EFE9]">Dense Regression Head & Loss</div>
                  <div className="text-xs text-[#8FB8A0]">Dense(32, ReLU) → Batch Normalization → Dropout(0.2) → Dense(1, Linear)</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#5FD38D] bg-[#16201B] px-3 py-1 rounded border border-[#24332B]">
                Loss: Huber (δ = 1.0)
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Zero Data Leakage Protocol */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#16201B] border border-[#24332B] space-y-6">
          <div className="flex items-center gap-3 border-b border-[#24332B] pb-4">
            <ShieldCheck className="w-6 h-6 text-[#5FD38D]" />
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#E7EFE9]">
                Strict Chronological Split (No Lookahead Bias)
              </h2>
              <p className="text-xs font-mono text-[#8FB8A0]">
                Why random train/test shuffling ruins financial models and how CottonCast guarantees purity.
              </p>
            </div>
          </div>

          <p className="text-sm text-[#E7EFE9]/85 leading-relaxed font-sans">
            In standard computer vision or tabular machine learning, cross-validation randomly shuffles instances.
            In financial time series, this creates catastrophic <strong>lookahead leakage</strong>: the model uses future price shocks
            to predict past states. CottonCast strictly enforces a <strong>strictly chronological 70 / 15 / 15 partition</strong>:
          </p>

          {/* Partition Timeline Bar */}
          <div className="space-y-2 font-mono">
            <div className="w-full h-8 rounded-lg overflow-hidden flex text-[11px] font-bold text-[#0E1512]">
              <div className="bg-[#5FD38D] w-[70%] flex items-center justify-center">
                Training Split (70%)
              </div>
              <div className="bg-[#F2C94C] w-[15%] flex items-center justify-center">
                Validation (15%)
              </div>
              <div className="bg-[#8FB8A0] w-[15%] flex items-center justify-center">
                Out-of-Sample Test (15%)
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-[#8FB8A0] pt-1">
              <span>Jan 2000 (Start)</span>
              <span>Nov 2018 (Train End)</span>
              <span>Jul 2022 (Val End)</span>
              <span>Present (Test Set)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1512] border border-[#24332B] text-xs font-mono space-y-2 text-[#8FB8A0]">
            <div className="flex items-center gap-2 text-[#5FD38D] font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Leakage Prevention Guarantees:</span>
            </div>
            <div>1. <code className="text-[#E7EFE9]">RobustScaler.fit()</code> is called exclusively on the first 70% of rows.</div>
            <div>2. Validation and Test splits are transformed using frozen train parameters (median & IQR).</div>
            <div>3. Sequence windows never span across train-validation boundaries.</div>
          </div>
        </section>

        {/* Section 3: Benchmark Comparison Table */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#16201B] border border-[#24332B] space-y-6">
          <div className="flex items-center gap-3 border-b border-[#24332B] pb-4">
            <BarChart2 className="w-6 h-6 text-[#F2C94C]" />
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#E7EFE9]">
                Empirical Benchmark vs Classical ARIMA Baseline
              </h2>
              <p className="text-xs font-mono text-[#8FB8A0]">
                Quantitative test set metrics on strictly unseen ICE Cotton No. 2 futures sessions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border border-[#24332B]">
              <thead className="bg-[#0E1512] text-[#8FB8A0] border-b border-[#24332B]">
                <tr>
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4 text-[#F2C94C]">Stacked LSTM + Attention</th>
                  <th className="py-3 px-4 text-[#8FB8A0]">ARIMA Baseline</th>
                  <th className="py-3 px-4">Econometric Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24332B]/60">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#E7EFE9]">MAPE (%)</td>
                  <td className="py-3 px-4 text-[#F2C94C] font-bold">{lstm.mape}%</td>
                  <td className="py-3 px-4">{arima.mape}%</td>
                  <td className="py-3 px-4 text-[#8FB8A0]">Mean absolute prediction magnitude error</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#E7EFE9]">RMSE (¢/lb)</td>
                  <td className="py-3 px-4 text-[#F2C94C] font-bold">{lstm.rmse} ¢</td>
                  <td className="py-3 px-4">{arima.rmse} ¢</td>
                  <td className="py-3 px-4 text-[#8FB8A0]">Penalizes large outlier forecast errors</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#E7EFE9]">R² (Coefficient of Det)</td>
                  <td className="py-3 px-4 text-[#5FD38D] font-bold">{lstm.r2}</td>
                  <td className="py-3 px-4">{arima.r2}</td>
                  <td className="py-3 px-4 text-[#8FB8A0]">Proportion of variance captured by model</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#E7EFE9]">Daily Directional Accuracy</td>
                  <td className="py-3 px-4 text-[#5FD38D] font-bold">{lstm.directional_accuracy_pct}%</td>
                  <td className="py-3 px-4">{arima.directional_accuracy_pct}%</td>
                  <td className="py-3 px-4 text-[#8FB8A0]">Mathematically consistent with Weak-Form EMH (~50%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Eugene Fama EMH Commentary */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#16201B] border border-[#24332B] space-y-4">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-[#5FD38D]" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#E7EFE9]">
              Eugene Fama&apos;s Weak-Form Efficient Market Hypothesis (EMH)
            </h2>
          </div>
          <p className="text-sm text-[#E7EFE9]/85 leading-relaxed font-sans">
            In liquid financial futures, daily price changes approximate a martingale difference sequence.
            Under Weak-Form EMH, technical price history alone cannot generate persistent daily directional predictions
            far above 50% without arbitrageurs eliminating the anomaly.
          </p>
          <div className="p-4 rounded-xl bg-[#0E1512] border border-[#24332B] text-xs font-mono text-[#8FB8A0] leading-relaxed">
            {metricsData.commentary}
          </div>
        </section>

        {/* Section 5: Model Limitations & Disclaimer */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#16201B] border border-[#24332B] space-y-6">
          <div className="flex items-center gap-3 border-b border-[#24332B] pb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#E7EFE9]">
                Model Limitations & Agricultural Factors
              </h2>
              <p className="text-xs font-mono text-[#8FB8A0]">
                Exogenous drivers not fully observable in end-of-day price series.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#0E1512] border border-[#24332B] space-y-2">
              <div className="text-amber-400 font-bold">1. Extreme Weather Shocks</div>
              <p className="text-[#8FB8A0]">
                Droughts across West Texas (Plains Cotton Growers region) or unseasonal monsoon flooding in Pakistan/India trigger discrete price gapping outside technical patterns.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1512] border border-[#24332B] space-y-2">
              <div className="text-amber-400 font-bold">2. USDA WASDE Reports</div>
              <p className="text-[#8FB8A0]">
                Monthly World Agricultural Supply and Demand Estimates release discrete crop yield forecasts, causing sudden intraday limit-up or limit-down moves.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1512] border border-[#24332B] space-y-2">
              <div className="text-amber-400 font-bold">3. Geopolitics & Tariffs</div>
              <p className="text-[#8FB8A0]">
                Bilateral trade agreements, currency devaluations, and synthetic fiber (polyester/crude oil) substitution cycles shift structural demand.
              </p>
            </div>
          </div>

          {/* Institutional Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed font-sans">
            <strong>NOT FINANCIAL ADVICE:</strong> CottonCast is developed strictly for academic, econometric, and machine learning research demonstration.
            Commodity futures and options trading involves substantial risk of capital loss and is not suitable for all investors. Never execute real capital orders based solely on statistical model projections.
          </div>
        </section>
      </main>

      <Footer variant="dark" />
    </div>
  );
}
