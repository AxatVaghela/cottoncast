import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CottonCast | Quantitative Cotton Futures Forecasting",
  description:
    "Institutional cotton price prediction using Deep Stacked LSTM networks with Bahdanau attention and Monte Carlo dropout uncertainty quantification.",
  keywords: ["Cotton futures", "CT=F", "LSTM", "Bahdanau Attention", "Quantitative Finance", "Machine Learning", "Commodities"],
  authors: [{ name: "Axat Vaghela" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-[#E8B04B]/20 selection:text-[#E8B04B]">
        {children}
      </body>
    </html>
  );
}
