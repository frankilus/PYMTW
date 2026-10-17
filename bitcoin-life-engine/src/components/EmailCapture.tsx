"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { storeReportHash, hashReport } from "@/lib/supabase";
import type { Report } from "@/types";

interface EmailCaptureProps {
  report: Report;
  onContinue: () => void;
}

export default function EmailCapture({ report, onContinue }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) return;

    setLoading(true);
    try {
      const reportJSON = JSON.stringify(report);
      const hash = hashReport(reportJSON);
      await storeReportHash(email, hash);
    } catch {
      // Silently fail — don't block user from seeing report
    }
    setLoading(false);
    onContinue();
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F7931A]/20 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-[#F7931A]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        Your Report is Ready!
      </h2>
      <p className="text-zinc-400 mb-6">
        Enter your email to receive a copy and unlock your personalized report.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F7931A] transition-colors"
        />

        <label className="flex items-start gap-3 text-left cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 accent-[#F7931A]"
          />
          <span className="text-xs text-zinc-400 leading-relaxed">
            I understand this is an <strong className="text-zinc-300">educational tool only</strong> and does NOT
            constitute financial, investment, tax, or legal advice. I accept
            full responsibility for my own financial decisions.
          </span>
        </label>

        <button
          type="submit"
          disabled={!email || !accepted || loading}
          className="w-full py-3 bg-[#F7931A] hover:bg-[#E8851A] text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "View My Report"}
        </button>
      </form>

      <button
        onClick={onContinue}
        className="mt-4 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        Skip — view without email
      </button>
    </motion.div>
  );
}
