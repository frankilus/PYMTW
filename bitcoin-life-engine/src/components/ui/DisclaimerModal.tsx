"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DISCLAIMER_TEXT } from "@/lib/constants";

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function DisclaimerModal({
  isOpen,
  onAccept,
}: DisclaimerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F7931A]/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#F7931A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Important Legal Disclaimer
              </h2>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {DISCLAIMER_TEXT}
              </p>
            </div>

            <p className="text-sm text-zinc-400 mb-6">
              By clicking &ldquo;I Understand & Accept&rdquo; below, you
              acknowledge that you have read and understood this disclaimer.
            </p>

            <button
              onClick={onAccept}
              className="w-full py-3 px-6 bg-[#F7931A] hover:bg-[#E8851A] text-black font-bold rounded-lg transition-colors duration-200"
            >
              I Understand & Accept
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
