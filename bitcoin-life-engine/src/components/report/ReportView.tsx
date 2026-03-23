"use client";

import { motion } from "framer-motion";
import type { Report } from "@/types";
import { DISCLAIMER_TEXT } from "@/lib/constants";

interface ReportViewProps {
  report: Report;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      className="mb-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-[#F7931A] rounded-full" />
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

export default function ReportView({ report }: ReportViewProps) {
  return (
    <div id="report-content" className="w-full max-w-3xl mx-auto">
      {/* Disclaimer Banner */}
      <motion.div
        className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-8"
        {...fadeIn}
      >
        <p className="text-xs text-yellow-500/80 leading-relaxed">
          ⚠️ {DISCLAIMER_TEXT}
        </p>
      </motion.div>

      {/* Profile Summary */}
      <Section title="Bitcoin Profile Summary" delay={0.1}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-6 mb-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F7931A"
                  strokeWidth="8"
                  strokeDasharray={`${report.profileScore * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {report.profileScore}
                </span>
              </div>
            </div>
            <div>
              <p className="text-lg text-zinc-200 leading-relaxed">
                {report.persona}
              </p>
              <p className="text-sm text-zinc-500 mt-2">
                BTC Price at generation: $
                {report.btcPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 12-Month Action Plan */}
      <Section title="Your Personalized 12-Month Action Plan" delay={0.2}>
        <div className="space-y-3">
          {report.monthlyPlan.map((step) => (
            <div
              key={step.month}
              className="flex gap-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#F7931A]/10 border border-[#F7931A]/30 flex items-center justify-center">
                <span className="text-sm font-bold text-[#F7931A]">
                  M{step.month}
                </span>
              </div>
              <div>
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${
                    step.category === "allocation"
                      ? "bg-blue-900/50 text-blue-400"
                      : step.category === "custody"
                      ? "bg-purple-900/50 text-purple-400"
                      : step.category === "education"
                      ? "bg-green-900/50 text-green-400"
                      : step.category === "rebalance"
                      ? "bg-yellow-900/50 text-yellow-400"
                      : "bg-[#F7931A]/20 text-[#F7931A]"
                  }`}
                >
                  {step.category}
                </span>
                <p className="text-sm text-zinc-300">{step.action}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Optimal Allocation */}
      <Section title="Optimal Allocation" delay={0.3}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <AllocationCard
              label="Bitcoin (BTC)"
              percent={report.allocation.btcPercent}
              color="#F7931A"
            />
            <AllocationCard
              label="MSTR Stock"
              percent={report.allocation.mstrPercent}
              color="#8B5CF6"
            />
            <AllocationCard
              label="Cash / Stable"
              percent={report.allocation.cashStablePercent}
              color="#22C55E"
            />
            <AllocationCard
              label="BTC ETF"
              percent={report.allocation.etfPercent}
              color="#3B82F6"
            />
          </div>
          {/* Bar visualization */}
          <div className="w-full h-4 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${report.allocation.btcPercent}%` }}
              className="bg-[#F7931A] h-full"
            />
            <div
              style={{ width: `${report.allocation.mstrPercent}%` }}
              className="bg-purple-500 h-full"
            />
            <div
              style={{ width: `${report.allocation.etfPercent}%` }}
              className="bg-blue-500 h-full"
            />
            <div
              style={{ width: `${report.allocation.cashStablePercent}%` }}
              className="bg-green-500 h-full"
            />
          </div>
        </div>
      </Section>

      {/* Weekly DCA */}
      <Section title="Recommended Weekly DCA" delay={0.4}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-zinc-500 mb-1">Weekly Purchase</p>
              <p className="text-4xl font-bold text-[#F7931A]">
                ${report.weeklyDCA}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                ≈ ${(report.weeklyDCA * 4).toLocaleString()}/month
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">
                Projected Stack in 12 Months
              </p>
              <p className="text-4xl font-bold text-white">
                {report.projectedStack12Mo.toFixed(6)} BTC
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                ≈ $
                {(
                  report.projectedStack12Mo * report.btcPrice
                ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                {" "}at current price
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-4">
            * Projection assumes constant BTC price. Actual results will vary.
            This is NOT a guarantee.
          </p>
        </div>
      </Section>

      {/* Custody Roadmap */}
      <Section title="Custody Roadmap" delay={0.5}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Current
              </p>
              <p className="text-zinc-300">{report.custodyRoadmap.current}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Recommended
              </p>
              <p className="text-[#F7931A]">
                {report.custodyRoadmap.recommended}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-white mb-3">
              Migration Steps:
            </p>
            <ol className="space-y-2">
              {report.custodyRoadmap.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-500">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-sm font-medium text-white mb-3">
              Security Checklist:
            </p>
            <ul className="space-y-2">
              {report.custodyRoadmap.securityChecklist.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-zinc-400"
                >
                  <span className="text-green-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Tax & Risk */}
      <Section title="Basic Tax & Risk Management Rules" delay={0.6}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h4 className="text-sm font-medium text-white mb-3">Tax Tips</h4>
            <ul className="space-y-2">
              {report.taxTips.map((tip, i) => (
                <li key={i} className="text-sm text-zinc-400 flex gap-2">
                  <span className="text-[#F7931A] flex-shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h4 className="text-sm font-medium text-white mb-3">Risk Rules</h4>
            <ul className="space-y-2">
              {report.riskRules.map((rule, i) => (
                <li key={i} className="text-sm text-zinc-400 flex gap-2">
                  <span className="text-red-400 flex-shrink-0">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Milestone Tracker */}
      <Section title="Milestone Tracker" delay={0.7}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          {report.milestones.map((milestone, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-300">{milestone.label}</span>
                <span className="text-zinc-500">{milestone.progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      milestone.progress === 100
                        ? "#22C55E"
                        : `linear-gradient(90deg, #F7931A, #FFB347)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${milestone.progress}%` }}
                  transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Big Disclaimer Footer */}
      <motion.div
        className="bg-red-900/10 border border-red-900/30 rounded-xl p-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h4 className="text-sm font-bold text-red-400 mb-2">
          IMPORTANT DISCLAIMER
        </h4>
        <p className="text-xs text-red-400/70 leading-relaxed">
          {DISCLAIMER_TEXT}
        </p>
      </motion.div>
    </div>
  );
}

function AllocationCard({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <div
        className="text-3xl font-bold mb-1"
        style={{ color }}
      >
        {percent}%
      </div>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
