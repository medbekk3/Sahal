---
description: RTL and Arabic localization standards for SAHAL driver and UI modules
globs: src/features/drivers/**/*,src/app/driver/**/*
alwaysApply: false
---

# SAHAL — RTL & Arabic Localization

## Layout
- Set `dir="rtl"` and `text-right` on page shells and section cards.
- Prefer logical CSS: `ms-*`, `me-*`, `start-*`, `end-*` over `ml-*` / `left-*`.
- Root app uses Cairo font via `layout.tsx` — do not introduce LTR-only fonts.

## Copy
- All user-facing strings live in `src/lib/i18n/ar.ts` (add keys under `driver` or relevant namespace).
- Import via `driverAr` from `@/features/drivers/lib/driver-i18n` for driver modules.
- Never hardcode English labels, toasts, or button text in driver UI.

## Dynamic data
- Currency: `formatCurrencyAr()` → `"١٬٢٠٠ دج"` (`src/lib/i18n/format.ts`).
- Dates: `formatDateAr()` with `ar-DZ` locale.
- Numbers: `formatNumberAr()`.
- Status codes: `mapStatusLabelAr()` before rendering.
- Firebase errors: `mapFirebaseErrorAr()` in toast/description.

## Components
- New driver components must wrap content in `dir="rtl"` and align text right.
- Icons in rows: place at the **start** (right side in RTL) or use `justify-end` flex rows.
