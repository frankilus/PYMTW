# Bitcoin Life Engine

A premium educational Bitcoin strategy generator that creates personalized wealth-building roadmaps based on users' life situations.

**⚠️ EDUCATIONAL TOOL ONLY — NOT financial, investment, tax, or legal advice.**

## Features

- 10-question wizard with real-time validation
- Personalized report with allocation model, DCA recommendations, and 12-month action plan
- PDF download (client-side via @react-pdf/renderer)
- PNG share image with watermark (html2canvas)
- Live BTC price from CoinGecko API
- Premium dark institutional theme
- Mobile-first, fully responsive
- Legal disclaimers enforced on every page

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form + Zod
- @react-pdf/renderer
- html2canvas
- Supabase (optional — anonymized data only)

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables (optional)
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup (Optional)

Create a `report_submissions` table:

```sql
CREATE TABLE report_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  report_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Add your Supabase URL and anon key to `.env.local`.

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel
```

## Calculation Engine

See `src/lib/calculations.ts` for the full personalization engine with documented example calculations.
