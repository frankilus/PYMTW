"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Report } from "@/types";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const ReportPDF = dynamic(() => import("./ReportPDF"), { ssr: false });

interface ReportActionsProps {
  report: Report;
}

export default function ReportActions({ report }: ReportActionsProps) {
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    setSharing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById("report-content");
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: "#0A0A0A",
        scale: 2,
      });

      // Add watermark
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "rgba(247, 147, 26, 0.4)";
        ctx.fillText("bitcoinlifeengine.com", 20, canvas.height - 20);
      }

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "bitcoin-life-engine-strategy.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-10">
      <PDFDownloadLink
        document={<ReportPDF report={report} />}
        fileName="bitcoin-life-engine-report.pdf"
      >
        {({ loading: pdfLoading }) => (
          <button
            disabled={pdfLoading}
            className="px-6 py-3 bg-[#F7931A] hover:bg-[#E8851A] text-black font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {pdfLoading ? "Preparing PDF..." : "Download PDF Report"}
          </button>
        )}
      </PDFDownloadLink>

      <button
        onClick={handleShare}
        disabled={sharing}
        className="px-6 py-3 border border-[#F7931A] text-[#F7931A] hover:bg-[#F7931A]/10 font-bold rounded-lg transition-colors disabled:opacity-50"
      >
        {sharing ? "Generating Image..." : "Share My Strategy"}
      </button>
    </div>
  );
}
