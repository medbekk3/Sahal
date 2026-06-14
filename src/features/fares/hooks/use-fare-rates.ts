"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getFirebaseDb } from "@/infrastructure/firebase/config";

export type FareRate = {
  id: string;
  from: string;
  to: string;
  price: number;
};

export function useFareRates() {
  const [rates, setRates] = useState<FareRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const ratesQuery = query(collection(getFirebaseDb(), "fare_rates"), orderBy("from"));

      return onSnapshot(
        ratesQuery,
        (snapshot) => {
          setRates(
            snapshot.docs.map((doc) => {
              const data = doc.data();

              return {
                id: doc.id,
                from: String(data.from ?? ""),
                to: String(data.to ?? ""),
                price: Number(data.price ?? 0),
              };
            })
          );
          setError(null);
          setLoading(false);
        },
        (snapshotError) => {
          setError(snapshotError.message);
          setLoading(false);
        }
      );
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : "Unable to load fare rates.");
      setLoading(false);
    }
  }, []);

  const fromOptions = useMemo(() => {
    return Array.from(new Set(rates.map((rate) => rate.from).filter(Boolean))).sort();
  }, [rates]);

  function getToOptions(from: string) {
    return rates
      .filter((rate) => rate.from === from)
      .map((rate) => rate.to)
      .filter(Boolean)
      .sort();
  }

  function getRate(from: string, to: string) {
    return rates.find((rate) => rate.from === from && rate.to === to) ?? null;
  }

  return {
    rates,
    fromOptions,
    loading,
    error,
    getToOptions,
    getRate,
  };
}
