import { z } from "zod";

// ─── Enums & Constants ────────────────────────────────────────────────────────

export const INCOME_RANGES = [
  { label: "Under $50K", value: "under50k" },
  { label: "$50K – $100K", value: "50k-100k" },
  { label: "$100K – $200K", value: "100k-200k" },
  { label: "$200K+", value: "200k-plus" },
] as const;

export const DEBT_RANGES = [
  { label: "$0 (No debt)", value: "none" },
  { label: "Under $50K", value: "under50k" },
  { label: "$50K – $100K", value: "50k-100k" },
  { label: "$100K+", value: "100k-plus" },
] as const;

export const CUSTODY_METHODS = [
  { label: "Exchange (e.g. Coinbase)", value: "exchange" },
  { label: "Hardware Wallet (e.g. Ledger)", value: "hardware" },
  { label: "Software Wallet (e.g. Blue Wallet)", value: "software" },
  { label: "Exchange + Self-Custody Mix", value: "exchange-selfcustody" },
  { label: "None — I don't hold any BTC yet", value: "none" },
] as const;

export const MAJOR_EXPENSES = [
  { label: "House Down Payment", value: "house" },
  { label: "Wedding", value: "wedding" },
  { label: "Car", value: "car" },
  { label: "Education", value: "education" },
  { label: "None", value: "none" },
] as const;

export const BITCOIN_FEARS = [
  { label: "Volatility / Price Crashes", value: "volatility" },
  { label: "Hacking / Theft", value: "hacking" },
  { label: "Losing Keys / Access", value: "losing-keys" },
  { label: "Government Regulation", value: "regulation" },
  { label: "Tax Complexity", value: "taxes" },
] as const;

// ─── Zod Schema ───────────────────────────────────────────────────────────────

export const formSchema = z.object({
  age: z.number().min(18).max(70),
  income: z.enum(["under50k", "50k-100k", "100k-200k", "200k-plus"]),
  monthlySavings: z.number().min(0).max(100000),
  bitcoinHoldings: z.number().min(0),
  holdingsUnit: z.enum(["btc", "usd"]),
  debt: z.enum(["none", "under50k", "50k-100k", "100k-plus"]),
  riskTolerance: z.number().min(1).max(10),
  targetRetirementAge: z.number().min(25).max(90),
  majorExpenses: z.array(z.string()).min(1),
  custodyMethod: z.enum([
    "exchange",
    "hardware",
    "software",
    "exchange-selfcustody",
    "none",
  ]),
  biggestFears: z.array(z.string()).min(1),
});

export type FormData = z.infer<typeof formSchema>;

// ─── Report Types ─────────────────────────────────────────────────────────────

export interface Allocation {
  btcPercent: number;
  mstrPercent: number;
  cashStablePercent: number;
  etfPercent: number;
}

export interface MonthlyStep {
  month: number;
  action: string;
  category: "allocation" | "custody" | "education" | "rebalance" | "milestone";
}

export interface CustodyStep {
  current: string;
  recommended: string;
  steps: string[];
  securityChecklist: string[];
}

export interface Report {
  profileScore: number;
  persona: string;
  allocation: Allocation;
  weeklyDCA: number;
  projectedStack12Mo: number;
  monthlyPlan: MonthlyStep[];
  custodyRoadmap: CustodyStep;
  taxTips: string[];
  riskRules: string[];
  milestones: { label: string; progress: number }[];
  btcPrice: number;
  generatedAt: string;
}
