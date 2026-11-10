"use client";

import { DISCLAIMER_TEXT } from "@/lib/constants";

export default function DisclaimerFooter() {
  return (
    <footer className="w-full border-t border-zinc-800 mt-16 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 leading-relaxed text-center">
            ⚠️ {DISCLAIMER_TEXT}
          </p>
        </div>
        <p className="text-center text-xs text-zinc-600 mt-4">
          © {new Date().getFullYear()} Bitcoin Life Engine. Educational purposes
          only.
        </p>
      </div>
    </footer>
  );
}
