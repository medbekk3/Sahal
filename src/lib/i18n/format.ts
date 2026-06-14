/** Arabic (Algeria) locale for dates and numbers across SAHAL. */
export const AR_LOCALE = "ar-DZ";

export function safeAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return amount;
}

/** Format currency with Arabic numerals and دج suffix. */
export function formatCurrencyAr(amount: unknown): string {
  return `${Math.round(safeAmount(amount)).toLocaleString(AR_LOCALE)} دج`;
}

/** Format integer counts with Arabic numerals. */
export function formatNumberAr(value: unknown): string {
  return Math.round(safeAmount(value)).toLocaleString(AR_LOCALE);
}

/** Format dates for Arabic UI (e.g. ٨ يونيو ٢٠٢٦). */
export function formatDateAr(value: unknown): string {
  let date: Date | null = null;

  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    date = value.toDate();
  } else if (value instanceof Date && !Number.isNaN(value.getTime())) {
    date = value;
  } else if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }

  if (!date) return "غير متوفر";

  return date.toLocaleDateString(AR_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const DRIVER_STATUS_LABELS: Record<string, string> = {
  online: "متاح",
  offline: "غير متاح",
  on_trip: "في رحلة",
  pending: "قيد المراجعة",
  approved: "موافق عليه",
  suspended: "موقوف",
  active: "نشط",
  inactive: "غير نشط",
  requested: "مطلوبة",
  accepted: "مقبولة",
  arriving: "في الطريق",
  in_progress: "جارية",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

export function mapStatusLabelAr(status: string): string {
  return DRIVER_STATUS_LABELS[status.toLowerCase()] ?? status;
}

export function mapFirebaseErrorAr(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("permission") || normalized.includes("insufficient")) {
    return "ليس لديك صلاحية لتنفيذ هذا الإجراء.";
  }
  if (normalized.includes("not found")) {
    return "لم يتم العثور على البيانات المطلوبة.";
  }
  if (normalized.includes("network")) {
    return "تحقق من اتصالك بالإنترنت وحاول مرة أخرى.";
  }

  return message.trim() || "حدث خطأ، يرجى المحاولة مرة أخرى.";
}
