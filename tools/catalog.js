/* Tool catalog: shared by the router and the /tools/ "Find the right tool." directory and search.
   Add every new tool or guide here; see the note above PT_GUIDES near the end of this file. */
var PT_CATS = [
 {
  "name": "Spending",
  "note": "Where is it all going?",
  "tools": [
   {
    "slug": "subscription-leak-finder",
    "icon": "🔍",
    "name": "Subscription leak finder",
    "desc": "Upload a bank CSV. See every recurring charge you forgot about.",
    "time": "30 sec",
    "live": true,
    "kw": [
     "subscription",
     "subscriptions",
     "recurring",
     "netflix",
     "wasted",
     "cancel",
     "membership",
     "statement",
     "leak",
     "streaming",
     "gym"
    ]
   },
   {
    "slug": "credit-card-optimizer",
    "icon": "💳",
    "name": "Credit card optimizer",
    "desc": "Find the type of card that pays you the most for how you actually spend.",
    "time": "45 sec",
    "live": true,
    "kw": [
     "credit card",
     "rewards",
     "cashback",
     "cash back",
     "points",
     "annual fee",
     "card",
     "miles"
    ]
   },
   {
    "slug": "paycheck-decoder",
    "icon": "🧾",
    "name": "Paycheck decoder",
    "desc": "Understand your pay stub with private photo/PDF import or manual entry.",
    "time": "3 min",
    "live": true,
    "kw": [
     "paycheck",
     "pay stub",
     "paystub",
     "withholding",
     "take home",
     "take-home",
     "salary",
     "deductions",
     "w-4",
     "w4"
    ]
   }
  ]
 },
 {
  "name": "Debt",
  "note": "Get to zero, faster.",
  "tools": [
   {
    "slug": "debt-payoff-planner",
    "icon": "📉",
    "name": "Debt payoff planner",
    "desc": "Your debt-free date, and the fastest order to pay things off.",
    "time": "60 sec",
    "live": true,
    "kw": [
     "debt",
     "owe",
     "loan",
     "loans",
     "payoff",
     "pay off",
     "student loan",
     "balance",
     "interest",
     "snowball",
     "avalanche",
     "collections",
     "credit card debt"
    ]
   },
   {
    "slug": "before-you-sign",
    "icon": "✍️",
    "name": "Before you sign",
    "desc": "True cost and red flags for a loan, card offer, lease or pay-later plan.",
    "time": "2 min",
    "live": true,
    "kw": [
     "before i sign",
     "before you sign",
     "sign",
     "signing",
     "contract",
     "car loan",
     "auto loan",
     "car payment",
     "dealer",
     "dealership",
     "personal loan",
     "loan offer",
     "balance transfer",
     "0% apr",
     "0 apr",
     "intro apr",
     "promo",
     "deferred interest",
     "lease",
     "leasing",
     "apartment",
     "rent an apartment",
     "buy now pay later",
     "bnpl",
     "afterpay",
     "klarna",
     "affirm",
     "pay in 4",
     "apr",
     "origination fee",
     "gap insurance",
     "extended warranty",
     "is this a good deal",
     "good deal",
     "financing",
     "finance a car",
     "red flags",
     "fine print"
    ]
   }
  ]
 },
 {
  "name": "Life changes",
  "note": "When things shift, know where you stand.",
  "tools": [
   {
    "slug": "money-timeline",
    "icon": "🗺️",
    "name": "Money timeline",
    "desc": "See when you’ll hit each goal on one timeline, and what moves the dates.",
    "time": "3 min",
    "live": true,
    "kw": [
     "timeline",
     "goals",
     "goal",
     "when can i",
     "when will i",
     "plan my future",
     "financial plan",
     "life plan",
     "down payment",
     "save for a house",
     "college",
     "kids college",
     "529",
     "retire by",
     "retire early",
     "when can i retire",
     "milestones",
     "roadmap",
     "future",
     "long term",
     "five year plan",
     "5 year plan",
     "on track for"
    ]
   },
   {
    "slug": "severance-runway",
    "icon": "🧭",
    "name": "Severance & job-loss runway",
    "desc": "Lost your job? See how many months you can last and what to do first.",
    "time": "60 sec",
    "live": true,
    "kw": [
     "lost my job",
     "laid off",
     "layoff",
     "fired",
     "severance",
     "unemployed",
     "unemployment",
     "job loss",
     "job",
     "cobra",
     "let go"
    ]
   },
   {
    "slug": "rent-vs-buy",
    "icon": "🏠",
    "name": "Rent vs. buy reality check",
    "desc": "The true cost of owning vs. renting, with no realtor math.",
    "time": "60 sec",
    "live": true,
    "kw": [
     "buy a home",
     "buy a house",
     "home",
     "house",
     "rent",
     "mortgage",
     "down payment",
     "renting",
     "buying",
     "condo"
    ]
   },
   {
    "slug": "emergency-fund-runway",
    "icon": "🛟",
    "name": "Emergency fund runway",
    "desc": "How long your savings would last, and how much is enough.",
    "time": "30 sec",
    "live": true,
    "kw": [
     "emergency",
     "savings",
     "rainy day",
     "cushion",
     "safety net",
     "runway",
     "save",
     "enough saved"
    ]
   }
  ]
 },
 {
  "name": "Retirement & investing",
  "note": "Make the long game simple.",
  "tools": [
   {
    "slug": "explain-my-401k",
    "icon": "📊",
    "name": "Explain my 401(k)",
    "desc": "Understand contributions, match, investments and fees with private photo/PDF import or manual entry.",
    "time": "5 min",
    "live": true,
    "kw": [
     "401k",
     "401(k)",
     "403b",
     "retirement",
     "match",
     "employer",
     "on track",
     "pension",
     "retire"
    ]
   },
   {
    "slug": "fee-x-ray",
    "icon": "🩻",
    "name": "Fee x-ray",
    "desc": "Reveal what your fund and advisor fees cost you over 30 years.",
    "time": "30 sec",
    "live": true,
    "kw": [
     "fee",
     "fees",
     "expense ratio",
     "paying too much",
     "advisor",
     "aum",
     "hidden",
     "cost",
     "costs",
     "fund"
    ]
   },
   {
    "slug": "roth-vs-traditional",
    "icon": "⚖️",
    "name": "Roth vs. traditional",
    "desc": "Which account wins for you, now and in retirement.",
    "time": "45 sec",
    "live": true,
    "kw": [
     "roth",
     "traditional",
     "ira",
     "tax now",
     "tax later",
     "conversion",
     "backdoor"
    ]
   }
  ]
 },
 {
  "name": "Bitcoin",
  "note": "Clear-eyed tools for long-term holders.",
  "tools": [
   {
    "slug": "bitcoin-tax-lot-cleanup",
    "icon": "🧮",
    "name": "Bitcoin tax-lot cleanup",
    "desc": "Review Bitcoin CSV records privately, find missing costs and duplicates, and explore account-specific FIFO lots.",
    "time": "5 min",
    "live": true,
    "kw": [
     "bitcoin tax",
     "crypto tax",
     "cost basis",
     "tax lot",
     "tax-lot",
     "8949",
     "capital gains",
     "coinbase",
     "exchange",
     "lots"
    ]
   },
   {
    "slug": "bitcoin-dca-backtester",
    "icon": "₿",
    "name": "Bitcoin DCA backtester",
    "desc": "See what buying a little every month would have actually done, vs. the S&P 500.",
    "time": "20 sec",
    "live": true,
    "kw": [
     "dca",
     "dollar cost",
     "dollar-cost",
     "bitcoin",
     "btc",
     "stack",
     "sats",
     "crypto",
     "backtest"
    ]
   },
   {
    "slug": "bitcoin-household-plan",
    "icon": "🗂️",
    "v7icon": "file",
    "name": "Bitcoin Household Plan",
    "featured": "For Bitcoin-owning households",
    "desc": "Write down why you hold Bitcoin, where it is and what your family should do, then print one binder. Free to build, $29 to print the binder. Never asks for secrets.",
    "time": "20 min",
    "live": true,
    "kw": [
     "inheritance",
     "starter kit",
     "family wealth",
     "executor letter",
     "estate",
     "bitcoin will",
     "self custody plan",
     "wallet inventory",
     "family",
     "estate plan",
     "if i die",
     "beneficiary",
     "letter of instruction",
     "bitcoin policy",
     "hardware wallet",
     "binder"
    ]
   }
  ]
 }
];
/*
 * "Find the right tool." directory on /tools/ (tools/v7/home.js reads this file).
 * SINGLE SOURCE OF TRUTH: every page in tools/sitemap.xml must be listed here.
 *  - A new calculator: add it to PT_CATS above (slug, name, desc, live, kw[]),
 *    then add its slug to one or more PT_TOPICS below.
 *  - A new guide or other non-calculator page: add it to PT_GUIDES, then add its
 *    slug to the "guides" topic (and any other topic where people would look).
 *  - kw[] holds the words people actually type (synonyms, plain-English phrases).
 * tests/find-right-tool.cjs fails if a sitemap URL is missing from this data,
 * from the directory, or from the no-JavaScript list in tools/index.html.
 */
var PT_GUIDES = [
 {"slug": "checkup", "kind": "start", "v7icon": "check", "name": "2-minute money checkup", "desc": "Answer a few quick questions and get a short list of what to look at first.", "kw": ["checkup", "check up", "where do i start", "not sure", "beginner", "getting started", "overwhelmed", "financial health", "money health", "quiz", "priorities", "first steps"]},
 {"slug": "guides/lost-my-job", "kind": "guide", "v7icon": "route", "name": "Just lost your job?", "desc": "What to do this week and next month: unemployment, severance, health coverage and your runway.", "kw": ["lost my job", "lost job", "laid off", "layoff", "fired", "unemployed", "unemployment", "severance", "cobra", "health insurance", "job loss", "final paycheck"]},
 {"slug": "guides/lost-my-job/checklist", "kind": "guide", "v7icon": "route", "name": "Printable lost-my-job checklist", "desc": "Four phases from the first 72 hours to day 90: unemployment, severance, health coverage, your 401(k) and the job search. Tick items off, then print.", "kw": ["lost my job checklist", "job loss checklist", "layoff checklist", "laid off checklist", "unemployment checklist", "severance checklist", "printable checklist", "printable", "checklist", "pdf", "cobra deadline", "what to do after a layoff", "90 days"]},
 {"slug": "guides/old-401k", "kind": "guide", "v7icon": "bars", "name": "Your old 401(k) after leaving a job", "desc": "Leave it, move it, roll it to an IRA or Roth IRA, or cash out: rules, costs and a rollover checklist.", "kw": ["old 401k", "401k", "401(k)", "403b", "rollover", "roll over", "rolling over", "rollover ira", "ira", "roth", "roth ira", "leaving a job", "leaving job", "left my job", "new job", "changing jobs", "switching jobs", "cash out", "cashing out", "withdraw", "early withdrawal", "20% withholding", "withholding", "rule of 55", "direct rollover", "retirement account"]},
 {"slug": "guides/first-home", "kind": "guide", "v7icon": "home", "name": "Buying your first home", "desc": "Get ready for a down payment, closing costs, mortgage pre-approval and a cash cushion.", "kw": ["first home", "first time buyer", "first-time buyer", "buy a house", "buy a home", "buying a home", "afford a home", "house", "down payment", "closing costs", "mortgage", "pre-approval", "preapproval"]},
 {"slug": "guides/first-home/checklist", "kind": "guide", "v7icon": "home", "name": "Printable first-time home buyer checklist", "desc": "Six phases from credit and savings to closing and year one. Tick items off, then print or save as a PDF.", "kw": ["first time home buyer checklist", "first-time home buyer checklist", "home buying checklist", "homebuyer checklist", "printable checklist", "printable", "checklist", "pdf", "closing checklist", "home inspection", "closing disclosure", "wire fraud", "rate lock"]},
 {"slug": "guides/true-cost-of-owning-a-home", "kind": "guide", "v7icon": "home", "name": "The true cost of owning a home", "desc": "Budget for the bills beyond the mortgage: upkeep, property tax, insurance, PMI and HOA.", "kw": ["cost of owning a home", "homeowner", "house", "property tax", "home insurance", "homeowners insurance", "hoa", "maintenance", "repairs", "pmi", "utilities", "closing costs", "mortgage"]},
 {"slug": "guides/true-cost-of-a-car", "kind": "guide", "v7icon": "car", "name": "The true cost of a car", "desc": "Plan beyond the sticker price: depreciation, insurance, fuel and upkeep.", "kw": ["car", "auto", "vehicle", "new car", "used car", "car payment", "car loan", "auto loan", "car insurance", "depreciation", "gas", "fuel", "maintenance", "transport"]},
 {"slug": "guides/true-cost-of-a-baby", "kind": "guide", "v7icon": "heart", "name": "The true cost of having a baby", "desc": "Plan for birth costs, child care, leave and the benefits and tax breaks to claim.", "kw": ["baby", "pregnant", "pregnancy", "newborn", "child", "kids", "child care", "childcare", "daycare", "day care", "parental leave", "maternity", "paternity", "child tax credit", "family"]},
 {"slug": "guides/true-cost-of-a-wedding", "kind": "guide", "v7icon": "heart", "name": "The true cost of a wedding", "desc": "Build a budget around your guest list and pay for the day without new debt.", "kw": ["wedding", "wedding budget", "engaged", "engagement", "marry", "married", "marriage", "honeymoon", "guest list", "venue"]}
];
/* Directory topics, in display order. A slug may appear in several topics.
   In the "All" view each page is shown once: calculators in their first topic,
   guides and the checkup in "guides". */
/* External sister-site links (StackCost). Shown and searchable in "Find the right tool." with an
   "External site" tag and opened in a new tab. They are NOT PYMTW pages: they are not in
   tools/sitemap.xml and are counted separately from tools and guides. */
var PT_EXTERNAL = [
 {"slug": "ext/stackcost-calculator", "url": "https://stackcost-pink.vercel.app/calculator", "kind": "external", "v7icon": "bitcoin", "name": "Bitcoin DCA Cost Calculator", "desc": "Enter any weekly or monthly amount and see what 8 apps (Cash App, Strike, River, Robinhood, Swan, Kraken, Coinbase, PayPal) really cost per year in fees and spread, ranked cheapest first.", "kw": ["dca cost", "dca fees", "fees", "fee", "spread", "cash app", "strike", "river", "robinhood", "swan", "kraken", "coinbase", "paypal", "cheapest app to buy bitcoin", "cheapest way to buy bitcoin", "bitcoin fees", "buy bitcoin", "stackcost", "calculator", "weekly", "monthly", "dca calculator", "cost per year", "compare platforms", "withdrawal fee", "compare bitcoin apps", "compare bitcoin", "compare apps", "compare"]}
];
var PT_TOPICS = [
 {"id": "everyday", "name": "Everyday money", "desc": "Understand your pay, spending and savings goals.", "slugs": ["paycheck-decoder", "subscription-leak-finder", "credit-card-optimizer", "money-timeline", "checkup"]},
 {"id": "debt", "name": "Debt & emergencies", "desc": "Pay down balances and prepare for income changes.", "slugs": ["debt-payoff-planner", "emergency-fund-runway", "severance-runway", "guides/lost-my-job", "guides/lost-my-job/checklist"]},
 {"id": "home", "name": "Home & big purchases", "desc": "Compare your options and see the true cost before a big commitment.", "slugs": ["rent-vs-buy", "before-you-sign", "guides/first-home", "guides/first-home/checklist", "guides/true-cost-of-owning-a-home", "guides/true-cost-of-a-car"]},
 {"id": "retirement", "name": "Retirement & investing", "desc": "Understand your plan, tax choices, investment fees and an old 401(k).", "slugs": ["explain-my-401k", "roth-vs-traditional", "fee-x-ray", "guides/old-401k"]},
 {"id": "bitcoin", "name": "Bitcoin", "desc": "Write a plan for your family, organize your records and explore historical scenarios.", "slugs": ["bitcoin-household-plan", "bitcoin-tax-lot-cleanup", "bitcoin-dca-backtester", "ext/stackcost-calculator"]},
 {"id": "guides", "name": "Life guides & checkup", "desc": "Step-by-step guides for big life moments, plus a 2-minute checkup.", "slugs": ["checkup", "guides/lost-my-job", "guides/lost-my-job/checklist", "guides/old-401k", "guides/first-home", "guides/first-home/checklist", "guides/true-cost-of-owning-a-home", "guides/true-cost-of-a-car", "guides/true-cost-of-a-baby", "guides/true-cost-of-a-wedding"]}
];
if (typeof module !== "undefined") { module.exports = PT_CATS; module.exports.guides = PT_GUIDES; module.exports.topics = PT_TOPICS; module.exports.external = PT_EXTERNAL; }
