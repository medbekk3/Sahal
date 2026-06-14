/** Platform commission rate applied to every completed ride (10%). */
export const COMMISSION_RATE = 0.1;

export {
  formatCurrencyAr as formatDzd,
  formatDateAr as formatDateLabel,
  safeAmount,
} from "@/lib/i18n/format";

import { safeAmount } from "@/lib/i18n/format";

export function calculateCommission(
  ridePrice: unknown,
  rate: number = COMMISSION_RATE
): number {
  const price = safeAmount(ridePrice);
  const safeRate = Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : COMMISSION_RATE;
  return Number((price * safeRate).toFixed(2));
}

export function calculateNetEarnings(ridePrice: unknown, commission: unknown): number {
  return Number((safeAmount(ridePrice) - safeAmount(commission)).toFixed(2));
}

export function sumAmounts(values: unknown[]): number {
  return Number(
    values.reduce<number>((total, value) => total + safeAmount(value), 0).toFixed(2)
  );
}
