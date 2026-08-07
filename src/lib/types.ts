export interface Task {
  id: string;
  name: string;
  notes: string;
  done: boolean;
  /** ISO timestamp of when the task was completed. */
  completedAt: string | null;
  order: number;
}

export interface DayRecord {
  /** yyyy-MM-dd — primary key. */
  date: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = "dark" | "light";

export type AccentId = "emerald" | "blue" | "amber" | "rose" | "cyan" | "graphite";

export interface Settings {
  theme: ThemeMode;
  accent: AccentId;
  notificationsEnabled: boolean;
  morningReminder: string; // HH:mm
  nightReminder: string; // HH:mm
}

export interface AchievementState {
  /** achievement id -> ISO date unlocked */
  unlocked: Record<string, string>;
}

export interface BackupFile {
  app: "discipline";
  version: 1;
  exportedAt: string;
  days: DayRecord[];
  settings: Settings;
  achievements: AchievementState;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  accent: "emerald",
  notificationsEnabled: false,
  morningReminder: "06:00",
  nightReminder: "22:00",
};

export const ACCENTS: Record<AccentId, { label: string; l: number; c: number; h: number }> = {
  emerald: { label: "Emerald", l: 0.74, c: 0.15, h: 158 },
  blue: { label: "Blue", l: 0.68, c: 0.16, h: 250 },
  amber: { label: "Amber", l: 0.8, c: 0.15, h: 78 },
  rose: { label: "Rose", l: 0.7, c: 0.17, h: 15 },
  cyan: { label: "Cyan", l: 0.76, c: 0.13, h: 205 },
  graphite: { label: "Graphite", l: 0.75, c: 0.02, h: 265 },
};
