import { addDays, differenceInCalendarDays, isSameMonth, isSameWeek, isSameYear } from "date-fns";

import { fromKey, toKey } from "@/lib/date";
import type { DayRecord } from "@/lib/types";

export type DayStatus = "complete" | "partial" | "missed" | "empty";

export function dayProgress(day: DayRecord | undefined) {
  const total = day?.tasks.length ?? 0;
  const completed = day?.tasks.filter((t) => t.done).length ?? 0;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent };
}

export function dayStatus(day: DayRecord | undefined): DayStatus {
  const { total, completed } = dayProgress(day);
  if (total === 0) return "empty";
  if (completed === total) return "complete";
  if (completed === 0) return "missed";
  return "partial";
}

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  todayPercent: number;
  weekPercent: number;
  monthPercent: number;
  yearPercent: number;
  averagePercent: number;
  totalCompleted: number;
  totalMissed: number;
  daysLogged: number;
  perfectDays: number;
  bestDay: { date: string; percent: number } | null;
  worstDay: { date: string; percent: number } | null;
}

function averageOf(days: DayRecord[]) {
  if (days.length === 0) return 0;
  const sum = days.reduce((acc, d) => acc + dayProgress(d).percent, 0);
  return Math.round(sum / days.length);
}

export function computeStats(days: DayRecord[], today: string, streakSince?: string | null): Stats {
  const logged = days.filter((d) => d.tasks.length > 0 && d.date <= today);
  const streakDays = streakSince ? logged.filter((d) => d.date >= streakSince) : logged;
  const byDate = new Map(streakDays.map((d) => [d.date, d]));
  const now = fromKey(today);

  // Streaks
  let currentStreak = 0;
  const todayComplete = dayStatus(byDate.get(today)) === "complete";
  let cursor = todayComplete ? now : addDays(now, -1);
  for (;;) {
    const record = byDate.get(toKey(cursor));
    if (record && dayStatus(record) === "complete") {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    } else break;
  }

  let longestStreak = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of streakDays) {
    const isConsecutive =
      previous !== null && differenceInCalendarDays(fromKey(day.date), fromKey(previous)) === 1;
    if (dayStatus(day) === "complete") {
      run = isConsecutive ? run + 1 : 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
    previous = day.date;
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  const ranked = [...logged].sort(
    (a, b) => dayProgress(b).percent - dayProgress(a).percent || a.date.localeCompare(b.date),
  );
  const best = ranked.at(0);
  const worst = ranked.at(-1);

  return {
    currentStreak,
    longestStreak,
    todayPercent: dayProgress(logged.find((d) => d.date === today)).percent,
    weekPercent: averageOf(logged.filter((d) => isSameWeek(fromKey(d.date), now, { weekStartsOn: 1 }))),
    monthPercent: averageOf(logged.filter((d) => isSameMonth(fromKey(d.date), now))),
    yearPercent: averageOf(logged.filter((d) => isSameYear(fromKey(d.date), now))),
    averagePercent: averageOf(logged),
    totalCompleted: logged.reduce((acc, d) => acc + d.tasks.filter((t) => t.done).length, 0),
    totalMissed: logged.reduce((acc, d) => acc + d.tasks.filter((t) => !t.done).length, 0),
    daysLogged: logged.length,
    perfectDays: logged.filter((d) => dayStatus(d) === "complete").length,
    bestDay: best ? { date: best.date, percent: dayProgress(best).percent } : null,
    worstDay: worst ? { date: worst.date, percent: dayProgress(worst).percent } : null,
  };
}
