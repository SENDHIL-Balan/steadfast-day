import type { Stats } from "@/lib/stats";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** Progress value + target for the meter. */
  progress: (stats: Stats) => { value: number; target: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-day",
    title: "First Day",
    description: "Log your very first day of tasks.",
    progress: (s) => ({ value: s.daysLogged, target: 1 }),
  },
  {
    id: "perfect-day",
    title: "Flawless",
    description: "Complete every task in a single day.",
    progress: (s) => ({ value: s.perfectDays, target: 1 }),
  },
  {
    id: "streak-7",
    title: "7 Day Streak",
    description: "Seven perfect days in a row.",
    progress: (s) => ({ value: s.longestStreak, target: 7 }),
  },
  {
    id: "streak-30",
    title: "30 Day Streak",
    description: "A full month without breaking.",
    progress: (s) => ({ value: s.longestStreak, target: 30 }),
  },
  {
    id: "streak-100",
    title: "100 Day Streak",
    description: "One hundred consecutive perfect days.",
    progress: (s) => ({ value: s.longestStreak, target: 100 }),
  },
  {
    id: "tasks-100",
    title: "100 Tasks",
    description: "Complete 100 tasks in total.",
    progress: (s) => ({ value: s.totalCompleted, target: 100 }),
  },
  {
    id: "tasks-500",
    title: "500 Tasks",
    description: "Complete 500 tasks in total.",
    progress: (s) => ({ value: s.totalCompleted, target: 500 }),
  },
  {
    id: "tasks-1000",
    title: "1000 Tasks",
    description: "Complete 1000 tasks in total.",
    progress: (s) => ({ value: s.totalCompleted, target: 1000 }),
  },
  {
    id: "days-365",
    title: "365 Days Logged",
    description: "A full year of planned days.",
    progress: (s) => ({ value: s.daysLogged, target: 365 }),
  },
];

export function evaluateAchievements(stats: Stats): string[] {
  return ACHIEVEMENTS.filter((a) => {
    const { value, target } = a.progress(stats);
    return value >= target;
  }).map((a) => a.id);
}
