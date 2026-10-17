import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Store an anonymized report hash + email.
 * Never stores raw financial data.
 */
export async function storeReportHash(email: string, reportHash: string) {
  if (!supabase) return null;

  const { data, error } = await supabase.from("report_submissions").insert([
    {
      email,
      report_hash: reportHash,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Supabase insert error:", error);
    return null;
  }

  return data;
}

export function hashReport(reportJSON: string): string {
  // Simple hash for anonymization — not cryptographic
  let hash = 0;
  for (let i = 0; i < reportJSON.length; i++) {
    const char = reportJSON.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
