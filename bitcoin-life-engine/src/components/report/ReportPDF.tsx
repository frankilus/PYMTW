"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Report } from "@/types";
import { DISCLAIMER_TEXT } from "@/lib/constants";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0A0A0A",
    padding: 40,
    color: "#E4E4E7",
    fontFamily: "Helvetica",
  },
  disclaimer: {
    backgroundColor: "#1C1917",
    border: "1 solid #78350F",
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 7,
    color: "#CA8A04",
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #F7931A",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#71717A",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    paddingLeft: 8,
    borderLeft: "3 solid #F7931A",
  },
  card: {
    backgroundColor: "#18181B",
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    color: "#71717A",
  },
  value: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  orangeValue: {
    fontSize: 11,
    color: "#F7931A",
    fontWeight: "bold",
  },
  bodyText: {
    fontSize: 9,
    color: "#A1A1AA",
    lineHeight: 1.5,
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: "1 solid #27272A",
  },
  stepMonth: {
    width: 35,
    fontSize: 9,
    fontWeight: "bold",
    color: "#F7931A",
  },
  stepText: {
    flex: 1,
    fontSize: 8,
    color: "#A1A1AA",
    lineHeight: 1.4,
  },
  bullet: {
    fontSize: 8,
    color: "#A1A1AA",
    lineHeight: 1.5,
    marginBottom: 3,
    paddingLeft: 10,
  },
  allocationRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  allocationItem: {
    alignItems: "center",
  },
  allocationPercent: {
    fontSize: 20,
    fontWeight: "bold",
  },
  allocationLabel: {
    fontSize: 8,
    color: "#71717A",
    marginTop: 2,
  },
  footer: {
    backgroundColor: "#1C1917",
    border: "1 solid #7F1D1D",
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  footerTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#EF4444",
    marginBottom: 4,
  },
  footerText: {
    fontSize: 7,
    color: "#EF4444",
    lineHeight: 1.4,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: "#52525B",
  },
  watermark: {
    position: "absolute",
    bottom: 20,
    left: 40,
    fontSize: 8,
    color: "#3F3F46",
  },
});

interface ReportPDFProps {
  report: Report;
}

export default function ReportPDF({ report }: ReportPDFProps) {
  return (
    <Document>
      {/* Page 1: Summary + Allocation */}
      <Page size="A4" style={styles.page}>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Bitcoin Life Engine Report</Text>
          <Text style={styles.subtitle}>
            Generated on{" "}
            {new Date(report.generatedAt).toLocaleDateString()} | BTC Price: $
            {report.btcPrice.toLocaleString()}
          </Text>
        </View>

        {/* Profile Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bitcoin Profile Summary</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Profile Score</Text>
              <Text style={styles.orangeValue}>
                {report.profileScore} / 100
              </Text>
            </View>
            <Text style={styles.bodyText}>{report.persona}</Text>
          </View>
        </View>

        {/* Allocation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optimal Allocation</Text>
          <View style={styles.card}>
            <View style={styles.allocationRow}>
              <View style={styles.allocationItem}>
                <Text style={[styles.allocationPercent, { color: "#F7931A" }]}>
                  {report.allocation.btcPercent}%
                </Text>
                <Text style={styles.allocationLabel}>Bitcoin</Text>
              </View>
              <View style={styles.allocationItem}>
                <Text style={[styles.allocationPercent, { color: "#8B5CF6" }]}>
                  {report.allocation.mstrPercent}%
                </Text>
                <Text style={styles.allocationLabel}>MSTR</Text>
              </View>
              <View style={styles.allocationItem}>
                <Text style={[styles.allocationPercent, { color: "#22C55E" }]}>
                  {report.allocation.cashStablePercent}%
                </Text>
                <Text style={styles.allocationLabel}>Cash/Stable</Text>
              </View>
              <View style={styles.allocationItem}>
                <Text style={[styles.allocationPercent, { color: "#3B82F6" }]}>
                  {report.allocation.etfPercent}%
                </Text>
                <Text style={styles.allocationLabel}>BTC ETF</Text>
              </View>
            </View>
          </View>
        </View>

        {/* DCA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Weekly DCA</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Weekly Purchase</Text>
              <Text style={styles.orangeValue}>${report.weeklyDCA}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Monthly Total</Text>
              <Text style={styles.value}>
                ${(report.weeklyDCA * 4).toLocaleString()}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Projected 12-Month Stack</Text>
              <Text style={styles.orangeValue}>
                {report.projectedStack12Mo.toFixed(6)} BTC
              </Text>
            </View>
            <Text
              style={[styles.disclaimerText, { color: "#52525B", marginTop: 4 }]}
            >
              * Projection assumes constant BTC price. Actual results will vary.
            </Text>
          </View>
        </View>

        {/* Custody */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custody Roadmap</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Current</Text>
              <Text style={styles.value}>
                {report.custodyRoadmap.current}
              </Text>
            </View>
            <View style={[styles.row, { marginBottom: 8 }]}>
              <Text style={styles.label}>Recommended</Text>
              <Text style={styles.orangeValue}>
                {report.custodyRoadmap.recommended}
              </Text>
            </View>
            {report.custodyRoadmap.steps.map((step, i) => (
              <Text key={i} style={styles.bullet}>
                {i + 1}. {step}
              </Text>
            ))}
          </View>
        </View>

        <Text style={styles.watermark}>bitcoinlifeengine.com</Text>
        <Text style={styles.pageNumber}>Page 1</Text>
      </Page>

      {/* Page 2: Action Plan + Tax/Risk */}
      <Page size="A4" style={styles.page}>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            12-Month Action Plan
          </Text>
          {report.monthlyPlan.map((step) => (
            <View key={step.month} style={styles.stepRow}>
              <Text style={styles.stepMonth}>Month {step.month}</Text>
              <Text style={styles.stepText}>{step.action}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Tips</Text>
          <View style={styles.card}>
            {report.taxTips.map((tip, i) => (
              <Text key={i} style={styles.bullet}>
                • {tip}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Management Rules</Text>
          <View style={styles.card}>
            {report.riskRules.map((rule, i) => (
              <Text key={i} style={styles.bullet}>
                • {rule}
              </Text>
            ))}
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestone Tracker</Text>
          <View style={styles.card}>
            {report.milestones.map((m, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <View style={styles.row}>
                  <Text style={styles.bodyText}>{m.label}</Text>
                  <Text style={styles.bodyText}>{m.progress}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>IMPORTANT DISCLAIMER</Text>
          <Text style={styles.footerText}>{DISCLAIMER_TEXT}</Text>
        </View>

        <Text style={styles.watermark}>bitcoinlifeengine.com</Text>
        <Text style={styles.pageNumber}>Page 2</Text>
      </Page>
    </Document>
  );
}
