import type { FormData, Report, Allocation, MonthlyStep, CustodyStep } from "@/types";

/**
 * Bitcoin Life Engine — Personalization Calculation Engine
 *
 * EXAMPLE CALCULATIONS (for future developers):
 *
 * Example 1: Conservative Saver
 *   Age=35, Income=$75K, Savings=$500/mo, Holdings=0.1 BTC, Debt=none,
 *   Risk=4, Retirement=65, Expenses=[none], Custody=exchange, Fears=[volatility]
 *   → AgeFactor = (35-18)/52*10 = 3.27
 *   → DebtLevel = 0
 *   → BTC Alloc = min((4/10*40) - 0 - 3.27, 35) = min(12.73, 35) = 12.73% → ~13%
 *   → MSTR = 0% (risk < 8)
 *   → Cash/Stable = 87%
 *   → Weekly DCA = ($500 * 0.7 * 0.13) / 4 = $11.38 → $10
 *
 * Example 2: Aggressive Young Investor
 *   Age=22, Income=$120K, Savings=$2000/mo, Holdings=0.5 BTC, Debt=none,
 *   Risk=9, Retirement=50, Expenses=[none], Custody=hardware, Fears=[regulation]
 *   → AgeFactor = (22-18)/52*10 = 0.77
 *   → DebtLevel = 0
 *   → BTC Alloc = min((9/10*40) - 0 - 0.77, 35) = min(35.23, 35) = 35%
 *   → MSTR = 10% (risk ≥8 AND debt=none)
 *   → Cash/Stable = 55%
 *   → Weekly DCA = ($2000 * 0.7 * 0.35) / 4 = $122.50 → $120
 *
 * Example 3: Debt-Heavy Mid-Career
 *   Age=42, Income=$90K, Savings=$800/mo, Holdings=0, Debt=$75K,
 *   Risk=6, Retirement=62, Expenses=[house], Custody=none, Fears=[volatility, taxes]
 *   → AgeFactor = (42-18)/52*10 = 4.62
 *   → DebtLevel = 2 (50k-100k bracket)
 *   → BTC Alloc = min((6/10*40) - 20 - 4.62, 35) = min(-0.62, 35) = 0% → floor at 5%
 *   → MSTR = 0%
 *   → Cash/Stable = max(95%, 20%) = 95% (has major expenses)
 *   → Weekly DCA = ($800 * 0.7 * 0.05) / 4 = $7 → $10 (min $10)
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDebtLevel(debt: FormData["debt"]): number {
  switch (debt) {
    case "none": return 0;
    case "under50k": return 1;
    case "50k-100k": return 2;
    case "100k-plus": return 3;
  }
}

function roundToNearest10(n: number): number {
  return Math.round(n / 10) * 10;
}

function hasMajorExpenses(expenses: string[]): boolean {
  return expenses.length > 0 && !expenses.every((e) => e === "none");
}

function getIncomeEstimate(income: FormData["income"]): number {
  switch (income) {
    case "under50k": return 35000;
    case "50k-100k": return 75000;
    case "100k-200k": return 150000;
    case "200k-plus": return 250000;
  }
}

// ─── Core Calculation ─────────────────────────────────────────────────────────

export function calculateAllocation(data: FormData): Allocation {
  const ageFactor = ((data.age - 18) / 52) * 10;
  const debtLevel = getDebtLevel(data.debt);
  const majorExp = hasMajorExpenses(data.majorExpenses);

  let btcPercent = Math.min(
    (data.riskTolerance / 10) * 40 - debtLevel * 10 - ageFactor,
    35
  );
  btcPercent = Math.max(btcPercent, 5); // Floor at 5%

  let mstrPercent = 0;
  if (data.riskTolerance >= 8 && debtLevel <= 1) {
    mstrPercent = Math.min(data.riskTolerance >= 9 ? 15 : 10, 15);
  }

  let cashStablePercent = 100 - btcPercent - mstrPercent;
  if (majorExp && cashStablePercent < 20) {
    const deficit = 20 - cashStablePercent;
    btcPercent = Math.max(btcPercent - deficit, 5);
    mstrPercent = Math.max(mstrPercent - Math.max(deficit - (btcPercent - 5), 0), 0);
    cashStablePercent = 100 - btcPercent - mstrPercent;
  }

  // Optional ETF allocation for moderate risk users
  let etfPercent = 0;
  if (data.riskTolerance >= 5 && data.riskTolerance <= 7 && cashStablePercent > 40) {
    etfPercent = 10;
    cashStablePercent -= 10;
  }

  return {
    btcPercent: Math.round(btcPercent),
    mstrPercent: Math.round(mstrPercent),
    cashStablePercent: Math.round(cashStablePercent),
    etfPercent: Math.round(etfPercent),
  };
}

export function calculateWeeklyDCA(
  monthlySavings: number,
  btcAllocPercent: number
): number {
  const raw = (monthlySavings * 0.7 * (btcAllocPercent / 100)) / 4;
  return Math.max(roundToNearest10(raw), 10);
}

export function calculateProfileScore(data: FormData): number {
  let score = 50;

  // Risk comfort adds up to 20
  score += data.riskTolerance * 2;

  // Lower debt is better
  score += (3 - getDebtLevel(data.debt)) * 5;

  // Higher savings rate relative to income
  const income = getIncomeEstimate(data.income);
  const savingsRate = data.monthlySavings * 12 / income;
  score += Math.min(savingsRate * 50, 15);

  // Already holding BTC is positive
  if (data.bitcoinHoldings > 0) score += 5;

  // Self-custody knowledge
  if (data.custodyMethod === "hardware") score += 5;
  if (data.custodyMethod === "exchange-selfcustody") score += 3;

  // Younger = more time
  score += Math.max((50 - data.age) / 5, 0);

  return Math.min(Math.max(Math.round(score), 1), 100);
}

function getPersona(score: number): string {
  if (score >= 85) return "Bitcoin Power Accumulator — You're positioned for aggressive, long-term wealth building.";
  if (score >= 70) return "Strategic Stacker — Solid foundation with room to optimize your Bitcoin strategy.";
  if (score >= 50) return "Balanced Builder — A measured approach that prioritizes stability while growing BTC exposure.";
  if (score >= 30) return "Cautious Explorer — Focus on debt reduction and education before increasing allocation.";
  return "Foundation First — Prioritize financial stability, then begin your Bitcoin journey.";
}

// ─── Monthly Plan Generator ───────────────────────────────────────────────────

function generateMonthlyPlan(data: FormData, allocation: Allocation): MonthlyStep[] {
  const plan: MonthlyStep[] = [];
  const needsCustodyUpgrade =
    data.custodyMethod === "exchange" || data.custodyMethod === "none";
  const hasDebt = getDebtLevel(data.debt) >= 2;
  const majorExp = hasMajorExpenses(data.majorExpenses);

  plan.push({
    month: 1,
    action: `Set up automatic DCA purchase of $${calculateWeeklyDCA(data.monthlySavings, allocation.btcPercent)}/week on a reputable exchange.`,
    category: "allocation",
  });

  plan.push({
    month: 2,
    action: "Research and compare Bitcoin custody options. Read about hardware wallets if you haven't already.",
    category: "education",
  });

  if (needsCustodyUpgrade) {
    plan.push({
      month: 3,
      action: "Purchase a hardware wallet (e.g., Ledger, Trezor, Coldcard). Set it up following manufacturer instructions.",
      category: "custody",
    });
    plan.push({
      month: 4,
      action: "Transfer a small test amount to your hardware wallet. Verify backup seed phrase is secure.",
      category: "custody",
    });
  } else {
    plan.push({
      month: 3,
      action: "Review and verify your seed phrase backup. Ensure it's stored in a fireproof, secure location.",
      category: "custody",
    });
  }

  if (hasDebt) {
    plan.push({
      month: 4,
      action: "Review high-interest debts. Consider allocating extra savings to debt above 7% APR before increasing BTC position.",
      category: "allocation",
    });
  }

  plan.push({
    month: 5,
    action: "Track your DCA progress. Review your cost basis and ensure you're logging all transactions for tax purposes.",
    category: "education",
  });

  plan.push({
    month: 6,
    action: `Rebalance portfolio toward target: ${allocation.btcPercent}% BTC, ${allocation.mstrPercent}% MSTR, ${allocation.cashStablePercent}% Cash/Stable.`,
    category: "rebalance",
  });

  if (majorExp) {
    plan.push({
      month: 7,
      action: "Reassess upcoming major expenses. Ensure your emergency fund and expense reserves are fully funded before increasing BTC allocation.",
      category: "allocation",
    });
  } else {
    plan.push({
      month: 7,
      action: "Consider increasing weekly DCA by 10% if your financial situation allows.",
      category: "allocation",
    });
  }

  plan.push({
    month: 8,
    action: "Deep-dive education month: Study Bitcoin's monetary policy, halving cycles, and long-term thesis.",
    category: "education",
  });

  if (needsCustodyUpgrade) {
    plan.push({
      month: 9,
      action: "Move majority of holdings to hardware wallet. Keep only small trading amount on exchange.",
      category: "custody",
    });
  } else {
    plan.push({
      month: 9,
      action: "Review multi-sig options for larger holdings. Consider geographic distribution of backups.",
      category: "custody",
    });
  }

  plan.push({
    month: 10,
    action: "Review tax implications of your YTD activity. Consult a crypto-aware tax professional if needed.",
    category: "education",
  });

  plan.push({
    month: 11,
    action: "Assess your risk tolerance — has it changed? Adjust allocation if your life circumstances have shifted.",
    category: "rebalance",
  });

  plan.push({
    month: 12,
    action: "Annual review: Compare actual stack vs. projections. Set new 12-month targets. Celebrate your discipline!",
    category: "milestone",
  });

  return plan;
}

// ─── Custody Roadmap ──────────────────────────────────────────────────────────

function generateCustodyRoadmap(data: FormData): CustodyStep {
  const currentLabels: Record<string, string> = {
    exchange: "Exchange Only (e.g., Coinbase, Kraken)",
    hardware: "Hardware Wallet",
    software: "Software Wallet",
    "exchange-selfcustody": "Exchange + Self-Custody Mix",
    none: "No Bitcoin Custody Yet",
  };

  const current = currentLabels[data.custodyMethod] || "Unknown";
  let recommended = "Hardware Wallet + Exchange for Active Trading";
  const steps: string[] = [];
  const securityChecklist: string[] = [
    "Write down seed phrase on metal/paper — NEVER digitally",
    "Store backup in a separate physical location (safe deposit box, fireproof safe)",
    "Enable 2FA on all exchange accounts (use authenticator app, NOT SMS)",
    "Use a dedicated email address for crypto accounts",
    "Never share your seed phrase or private keys with anyone",
    "Test recovery process with a small amount before transferring large sums",
  ];

  if (data.custodyMethod === "none") {
    recommended = "Start with reputable exchange → Graduate to hardware wallet";
    steps.push(
      "Create account on a reputable exchange (Coinbase, Kraken, or Swan Bitcoin)",
      "Complete identity verification",
      "Make your first small BTC purchase",
      "After accumulating 0.01+ BTC, purchase a hardware wallet",
      "Transfer holdings to hardware wallet",
      "Securely back up your seed phrase"
    );
  } else if (data.custodyMethod === "exchange") {
    steps.push(
      "Research hardware wallets (Ledger Nano, Trezor, Coldcard)",
      "Purchase hardware wallet from official manufacturer website only",
      "Set up wallet and record seed phrase securely",
      "Send a small test transaction from exchange to hardware wallet",
      "Verify you can receive and access funds",
      "Transfer remaining holdings (keep small amount on exchange if actively trading)"
    );
  } else if (data.custodyMethod === "software") {
    recommended = "Hardware Wallet (significant upgrade in security)";
    steps.push(
      "Continue using software wallet for small amounts",
      "Purchase hardware wallet for long-term storage",
      "Transfer long-term holdings to hardware wallet",
      "Keep software wallet for small, frequent transactions only"
    );
  } else if (data.custodyMethod === "exchange-selfcustody") {
    recommended = "Primarily Hardware Wallet (80%+) with minimal exchange balance";
    steps.push(
      "Audit current split between exchange and self-custody",
      "Move majority (80%+) of holdings to hardware wallet",
      "Keep only what you need for trading on exchange",
      "Consider multi-sig setup for large holdings (e.g., Casa, Unchained)"
    );
  } else {
    recommended = "Current setup is solid — consider multi-sig for large amounts";
    steps.push(
      "Verify seed phrase backup is secure and accessible",
      "Consider multi-sig for holdings over 1 BTC",
      "Review firmware updates for your hardware wallet",
      "Test recovery process annually"
    );
  }

  return { current, recommended, steps, securityChecklist };
}

// ─── Tax Tips ─────────────────────────────────────────────────────────────────

function generateTaxTips(data: FormData): string[] {
  const tips: string[] = [
    "Track the cost basis of every BTC purchase — use portfolio tracking software (e.g., CoinTracker, Koinly).",
    "In the US, holding BTC for over 1 year qualifies for lower long-term capital gains tax rates.",
    "Consider using tax-advantaged accounts (Bitcoin IRAs, solo 401k) if you're a high earner.",
  ];

  if (data.biggestFears.includes("taxes")) {
    tips.push("Consult a crypto-specialized CPA or tax attorney. Tax rules for crypto are evolving and vary by jurisdiction.");
  }

  if (getIncomeEstimate(data.income) >= 150000) {
    tips.push("High earners: Explore Opportunity Zone funds or charitable giving strategies with appreciated BTC.");
  }

  if (getDebtLevel(data.debt) >= 2) {
    tips.push("Losses from BTC can offset capital gains. Consider tax-loss harvesting strategies (where legal).");
  }

  return tips;
}

// ─── Risk Rules ───────────────────────────────────────────────────────────────

function generateRiskRules(data: FormData): string[] {
  const rules: string[] = [
    "Never invest more than you can afford to lose. Bitcoin is volatile.",
    `Maintain at least ${hasMajorExpenses(data.majorExpenses) ? "6-9" : "3-6"} months of expenses in a liquid emergency fund.`,
  ];

  if (data.biggestFears.includes("volatility")) {
    rules.push("Use dollar-cost averaging to reduce timing risk. Never try to time the market.");
    rules.push("Set a personal drawdown limit: if your portfolio drops X%, pause and reassess rather than panic selling.");
  }

  if (data.biggestFears.includes("hacking")) {
    rules.push("Never keep large amounts on exchanges. Use hardware wallets for long-term storage.");
    rules.push("Enable all available security features: 2FA, withdrawal whitelists, email confirmations.");
  }

  if (data.biggestFears.includes("losing-keys")) {
    rules.push("Create redundant seed phrase backups in separate secure locations.");
    rules.push("Consider a multi-sig setup so no single point of failure can lose your funds.");
  }

  if (data.biggestFears.includes("regulation")) {
    rules.push("Stay compliant: report all transactions, use regulated exchanges, and keep thorough records.");
    rules.push("Diversify across jurisdictions if holding significant amounts (consult legal counsel).");
  }

  if (data.biggestFears.includes("taxes")) {
    rules.push("Log every transaction immediately. Reconstructing history later is painful and error-prone.");
  }

  return rules.slice(0, 5);
}

// ─── Milestones ───────────────────────────────────────────────────────────────

function generateMilestones(
  data: FormData,
  allocation: Allocation,
  weeklyDCA: number,
  btcPrice: number
): { label: string; progress: number }[] {
  const currentBTC =
    data.holdingsUnit === "btc"
      ? data.bitcoinHoldings
      : data.bitcoinHoldings / btcPrice;

  const yearlyDCAbtc = (weeklyDCA * 52) / btcPrice;
  const projected = currentBTC + yearlyDCAbtc;

  const milestones = [
    { label: "First BTC Purchase", progress: currentBTC > 0 ? 100 : 0 },
    {
      label: "Self-Custody Setup",
      progress:
        data.custodyMethod === "hardware"
          ? 100
          : data.custodyMethod === "exchange-selfcustody"
          ? 60
          : data.custodyMethod === "software"
          ? 40
          : 0,
    },
    {
      label: `Stack 0.01 BTC ($${(0.01 * btcPrice).toLocaleString()})`,
      progress: Math.min(Math.round((projected / 0.01) * 100), 100),
    },
    {
      label: `Stack 0.1 BTC ($${(0.1 * btcPrice).toLocaleString()})`,
      progress: Math.min(Math.round((projected / 0.1) * 100), 100),
    },
    {
      label: `Stack 1 BTC ($${btcPrice.toLocaleString()})`,
      progress: Math.min(Math.round((projected / 1) * 100), 100),
    },
  ];

  return milestones;
}

// ─── Main Report Generator ────────────────────────────────────────────────────

export function generateReport(data: FormData, btcPrice: number): Report {
  const allocation = calculateAllocation(data);
  const weeklyDCA = calculateWeeklyDCA(data.monthlySavings, allocation.btcPercent);
  const profileScore = calculateProfileScore(data);
  const persona = getPersona(profileScore);

  const currentBTC =
    data.holdingsUnit === "btc"
      ? data.bitcoinHoldings
      : data.bitcoinHoldings / btcPrice;

  const yearlyDCAbtc = (weeklyDCA * 52) / btcPrice;
  const projectedStack12Mo = currentBTC + yearlyDCAbtc;

  return {
    profileScore,
    persona,
    allocation,
    weeklyDCA,
    projectedStack12Mo,
    monthlyPlan: generateMonthlyPlan(data, allocation),
    custodyRoadmap: generateCustodyRoadmap(data),
    taxTips: generateTaxTips(data),
    riskRules: generateRiskRules(data),
    milestones: generateMilestones(data, allocation, weeklyDCA, btcPrice),
    btcPrice,
    generatedAt: new Date().toISOString(),
  };
}
