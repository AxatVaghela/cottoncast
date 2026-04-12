import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface FooterProps {
  variant?: "light" | "dark";
}

export default function Footer({ variant = "light" }: FooterProps) {
  const isDark = variant === "dark";

  return (
    <footer
      className={`border-t transition-colors mt-auto ${
        isDark
          ? "bg-[#0E1512] border-[#24332B] text-[#E7EFE9]/70"
          : "bg-[#F7F3EA] border-[#CFE3D3]/60 text-[#1B2A21]/75"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-[#1F3D2B] dark:text-[#E7EFE9]">
                Cotton<span className="text-[#E8B04B]">Cast</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#E8B04B]/15 text-[#E8B04B] font-bold">
                Quant Engine v1.0
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-md">
              Cotton Price Prediction Using Deep LSTM Networks with Bahdanau Attention.
              Engineered with zero-leakage chronological partitioning, Monte Carlo dropout
              uncertainty quantification, and out-of-sample backtests against classical ARIMA baselines.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#8FB8A0]">
              <span>ICE Futures US: Cotton No. 2 (`CT=F`)</span>
              <span>•</span>
              <span>Daily Resolution (2000–Present)</span>
            </div>
          </div>

          <div>
            <h4 className={`text-xs font-mono uppercase font-bold tracking-wider mb-3 ${isDark ? "text-[#E7EFE9]" : "text-[#1B2A21]"}`}>
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-[#E8B04B] transition-colors">
                  Overview & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#E8B04B] transition-colors">
                  Quantitative Terminal
                </Link>
              </li>
              <li>
                <Link href="/model" className="hover:text-[#E8B04B] transition-colors">
                  Neural Architecture & Validation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={`text-xs font-mono uppercase font-bold tracking-wider mb-3 ${isDark ? "text-[#E7EFE9]" : "text-[#1B2A21]"}`}>
              Institutional Notice
            </h4>
            <div className="text-[11px] leading-relaxed space-y-2">
              <div className="flex items-start gap-1.5 text-amber-500/90">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Research & Educational Model</span>
              </div>
              <p className="text-[11px] opacity-75">
                Past backtest performance does not guarantee future results. Commodity futures trading involves substantial risk of loss.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#24332B]/30 flex flex-col sm:flex-row items-center justify-between text-xs font-mono opacity-80 gap-3">
          <p>© 2026 CottonCast by Axat Vaghela. All quantitative pipelines open source.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#5FD38D]">Status: Online</span>
            <span>•</span>
            <span className="text-[#F2C94C]">90D Horizon Calibrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
