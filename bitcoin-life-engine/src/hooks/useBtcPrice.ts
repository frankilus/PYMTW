"use client";

import { useState, useEffect } from "react";
import { COINGECKO_API_URL, FALLBACK_BTC_PRICE } from "@/lib/constants";

export function useBtcPrice() {
  const [price, setPrice] = useState<number>(FALLBACK_BTC_PRICE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrice() {
      try {
        const res = await fetch(COINGECKO_API_URL);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled && data.bitcoin?.usd) {
          setPrice(data.bitcoin.usd);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPrice();
    return () => {
      cancelled = true;
    };
  }, []);

  return { price, loading, error };
}
