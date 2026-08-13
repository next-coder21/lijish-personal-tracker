import { format, parseISO } from "date-fns";

/** `0.9444` -> `"94.4%"`. Whole numbers drop the decimal: `1` -> `"100%"`. */
export function pct(value: number, digits = 1) {
  const n = value * 100;
  return `${Number.isInteger(n) ? n : n.toFixed(digits)}%`;
}

/** Signed percentage-point delta: `+3.2 pts`. */
export function ptsDelta(value: number, digits = 1) {
  const n = value * 100;
  return `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(digits)} pts`;
}

export function signed(value: number, digits = 0) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}`;
}

export function num(value: number, digits = 1) {
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

export function shortDate(iso: string) {
  return format(parseISO(iso), "d MMM");
}

export function longDate(iso: string) {
  return format(parseISO(iso), "EEE, d MMM yyyy");
}
