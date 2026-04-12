"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Cpu, LineChart } from "lucide-react";

interface NavbarProps {
  variant?: "light" | "dark";
}

export default function Navbar({ variant = "light" }: NavbarProps) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  return (
    <header
      className={`w-full sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDark
          ? "bg-[#0E1512]/90 border-[#24332B] text-[#E7EFE9]"
          : "bg-[#F7F3EA]/90 border-[#CFE3D3]/60 text-[#1B2A21]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif font-black text-lg transition-transform group-hover:scale-105 shadow-sm ${
              isDark
                ? "bg-[#1F3D2B] text-[#F2C94C] border border-[#24332B]"
                : "bg-[#1F3D2B] text-[#E8B04B]"
            }`}
          >
            C
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl tracking-tight leading-none">
              Cotton<span className="text-[#E8B04B]">Cast</span>
            </span>
            <span
              className={`text-[10px] uppercase tracking-widest font-mono mt-0.5 ${
                isDark ? "text-[#8FB8A0]" : "text-[#1F3D2B]/70"
              }`}
            >
              ICE CT=F Futures
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === "/"
                ? isDark
                  ? "bg-[#16201B] text-[#5FD38D]"
                  : "bg-[#CFE3D3]/50 text-[#1F3D2B] font-semibold"
                : isDark
                ? "text-[#E7EFE9]/70 hover:text-[#E7EFE9] hover:bg-[#16201B]/50"
                : "text-[#1B2A21]/70 hover:text-[#1B2A21] hover:bg-[#CFE3D3]/30"
            }`}
          >
            Overview
          </Link>
          <Link
            href="/dashboard"
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
              pathname === "/dashboard"
                ? isDark
                  ? "bg-[#16201B] text-[#5FD38D] font-semibold border border-[#24332B]"
                  : "bg-[#1F3D2B] text-[#F7F3EA]"
                : isDark
                ? "text-[#E7EFE9]/70 hover:text-[#E7EFE9] hover:bg-[#16201B]/50"
                : "text-[#1B2A21]/70 hover:text-[#1B2A21] hover:bg-[#CFE3D3]/30"
            }`}
          >
            <LineChart className="w-4 h-4 text-[#E8B04B]" />
            Terminal
          </Link>
          <Link
            href="/model"
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
              pathname === "/model"
                ? isDark
                  ? "bg-[#16201B] text-[#5FD38D] font-semibold border border-[#24332B]"
                  : "bg-[#CFE3D3]/50 text-[#1F3D2B] font-semibold"
                : isDark
                ? "text-[#E7EFE9]/70 hover:text-[#E7EFE9] hover:bg-[#16201B]/50"
                : "text-[#1B2A21]/70 hover:text-[#1B2A21] hover:bg-[#CFE3D3]/30"
            }`}
          >
            <Cpu className="w-4 h-4 text-[#8FB8A0]" />
            Methodology
          </Link>
        </nav>

        {/* Right Action Badges */}
        <div className="flex items-center gap-3">
          <div
            className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono border ${
              isDark
                ? "bg-[#16201B] border-[#24332B] text-[#8FB8A0]"
                : "bg-white/80 border-[#CFE3D3] text-[#1F3D2B]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#5FD38D] animate-gold-pulse" />
            <span>CT=F ACTIVE</span>
          </div>

          <Link
            href="/dashboard"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
              isDark
                ? "bg-[#5FD38D] hover:bg-[#4ec57c] text-[#0E1512]"
                : "bg-[#1F3D2B] hover:bg-[#172e20] text-[#F7F3EA]"
            }`}
          >
            Launch Terminal
          </Link>
        </div>
      </div>
    </header>
  );
}
