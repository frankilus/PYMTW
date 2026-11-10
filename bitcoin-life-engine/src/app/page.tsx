"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FormData, Report } from "@/types";
import { generateReport } from "@/lib/calculations";
import { useBtcPrice } from "@/hooks/useBtcPrice";
import DisclaimerModal from "@/components/ui/DisclaimerModal";
import DisclaimerFooter from "@/components/ui/DisclaimerFooter";
import WizardForm from "@/components/wizard/WizardForm";
import EmailCapture from "@/components/EmailCapture";
import ReportView from "@/components/report/ReportView";
import ReportActions from "@/components/report/ReportActions";

type AppPhase = "disclaimer" | "wizard" | "email" | "report";

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("disclaimer");
  const [report, setReport] = useState<Report | null>(null);
  const { price: btcPrice, loading: priceLoading } = useBtcPrice();

  const handleDisclaimerAccept = useCallback(() => {
    setPhase("wizard");
  }, []);

  const handleFormComplete = useCallback(
    (data: FormData) => {
      const generatedReport = generateReport(data, btcPrice);
      setReport(generatedReport);
      setPhase("email");
    },
    [btcPrice]
  );

  const handleEmailContinue = useCallback(() => {
    setPhase("report");
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <DisclaimerModal
        isOpen={phase === "disclaimer"}
        onAccept={handleDisclaimerAccept}
      />

      {/* Header */}
      <header className="w-full border-b border-zinc-800/50 py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F7931A] flex items-center justify-center">
              <span className="text-black font-bold text-sm">₿</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">
                Bitcoin Life Engine
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Educational Tool Only
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Live BTC Price</p>
            <p className="text-sm font-mono text-[#F7931A]">
              {priceLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `$${btcPrice.toLocaleString()}`
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {phase === "wizard" && (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Build Your Bitcoin Strategy
                </h2>
                <p className="text-zinc-400 max-w-xl mx-auto">
                  Answer 10 questions about your financial situation and
                  we&apos;ll generate a personalized, educational Bitcoin
                  roadmap.
                </p>
              </div>
              <WizardForm onComplete={handleFormComplete} />
            </motion.div>
          )}

          {phase === "email" && report && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EmailCapture
                report={report}
                onContinue={handleEmailContinue}
              />
            </motion.div>
          )}

          {phase === "report" && report && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Your Personalized Bitcoin Strategy
                </h2>
                <p className="text-zinc-400">
                  Generated on{" "}
                  {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>
              <ReportActions report={report} />
              <ReportView report={report} />
            </motion.div>
          )}

          {phase === "disclaimer" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-[#F7931A]/20 flex items-center justify-center mb-6">
                <span className="text-4xl text-[#F7931A]">₿</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Bitcoin Life Engine
              </h2>
              <p className="text-xl text-zinc-400 max-w-lg">
                Your personalized Bitcoin wealth-building roadmap.
                <br />
                <span className="text-sm text-zinc-500">
                  Educational purposes only.
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DisclaimerFooter />
    </main>
  );
}
