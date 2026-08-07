import { addDays, format, parseISO, startOfDay } from "date-fns";

export const DAY_KEY = "yyyy-MM-dd";

export function toKey(date: Date): string {
  return format(date, DAY_KEY);
}

export function fromKey(key: string): Date {
  return startOfDay(parseISO(key));
}

export function todayKey(now: Date = new Date()): string {
  return toKey(now);
}

export function tomorrowKey(now: Date = new Date()): string {
  return toKey(addDays(now, 1));
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export function prettyDate(key: string): string {
  return format(fromKey(key), "EEEE, d MMMM yyyy");
}

export function shortDate(key: string): string {
  return format(fromKey(key), "d MMM yyyy");
}

export function clockTime(now: Date): string {
  return format(now, "HH:mm:ss");
}

export function completionTime(iso: string): string {
  return format(parseISO(iso), "HH:mm");
}

/** Milliseconds until the next local midnight. */
export function msUntilMidnight(now: Date = new Date()): number {
  return startOfDay(addDays(now, 1)).getTime() - now.getTime();
}
