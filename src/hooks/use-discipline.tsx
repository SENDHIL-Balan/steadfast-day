import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as db from "@/lib/db";
import {
  msUntilMidnight,
  todayKey as getTodayKey,
  tomorrowKey as getTomorrowKey,
} from "@/lib/date";
import {
  ACCENTS,
  DEFAULT_SETTINGS,
  type AchievementState,
  type BackupFile,
  type DayRecord,
  type Settings,
  type Task,
} from "@/lib/types";
import { computeStats, type Stats } from "@/lib/stats";
import { evaluateAchievements } from "@/lib/achievements";

interface DisciplineContextValue {
  ready: boolean;
  days: DayRecord[];
  settings: Settings;
  achievements: AchievementState;
  todayKey: string;
  tomorrowKey: string;
  stats: Stats;
  getDay: (date: string) => DayRecord | undefined;
  addTask: (date: string, name: string, notes?: string) => Promise<void>;
  updateTask: (
    date: string,
    id: string,
    patch: Partial<Pick<Task, "name" | "notes">>,
  ) => Promise<void>;
  setTaskDone: (date: string, id: string, done: boolean) => Promise<void>;
  deleteTask: (date: string, id: string) => Promise<void>;
  duplicateTask: (date: string, id: string) => Promise<void>;
  reorderTasks: (date: string, orderedIds: string[]) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  exportData: () => BackupFile;
  importData: (file: BackupFile) => Promise<void>;
  clearAllData: () => Promise<void>;
  resetAchievements: () => Promise<void>;
  resetStreak: () => Promise<void>;
}

const DisciplineContext = createContext<DisciplineContextValue | null>(null);

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyDay(date: string): DayRecord {
  const now = new Date().toISOString();
  return { date, tasks: [], createdAt: now, updatedAt: now };
}

export function DisciplineProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState<DayRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [achievements, setAchievements] = useState<AchievementState>({ unlocked: {} });
  const [today, setToday] = useState(() => getTodayKey());
  const [tomorrow, setTomorrow] = useState(() => getTomorrowKey());

  // Initial hydration from IndexedDB (client only).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedDays, storedSettings, storedAchievements] = await Promise.all([
          db.readAllDays(),
          db.readSettings(),
          db.readAchievements(),
        ]);
        if (cancelled) return;
        setDays(storedDays);
        setSettings(storedSettings);
        setAchievements(storedAchievements);
      } catch (error) {
        console.error("Failed to load local data", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Midnight rollover: today/tomorrow are derived from the date key, so a single
  // tick flips yesterday into history and tomorrow into today.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setToday(getTodayKey());
        setTomorrow(getTomorrowKey());
        schedule();
      }, msUntilMidnight() + 1000);
    };
    schedule();
    const onVisible = () => {
      setToday(getTodayKey());
      setTomorrow(getTomorrowKey());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Theme + accent application.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    const accent = ACCENTS[settings.accent] ?? ACCENTS.emerald;
    root.style.setProperty("--accent-l", String(accent.l));
    root.style.setProperty("--accent-c", String(accent.c));
    root.style.setProperty("--accent-h", String(accent.h));
  }, [settings.theme, settings.accent]);

  const stats = useMemo(
    () => computeStats(days, today, settings.streakResetAt ?? null),
    [days, today, settings.streakResetAt],
  );

  // Achievement unlocking runs automatically off stats.
  const achievementsRef = useRef(achievements);
  achievementsRef.current = achievements;
  useEffect(() => {
    if (!ready) return;
    const unlockedIds = evaluateAchievements(stats);
    const current = achievementsRef.current.unlocked;
    const missing = unlockedIds.filter((id) => !current[id]);
    if (missing.length === 0) return;
    const stamp = new Date().toISOString();
    const next: AchievementState = {
      unlocked: { ...current, ...Object.fromEntries(missing.map((id) => [id, stamp])) },
    };
    setAchievements(next);
    void db.writeAchievements(next);
  }, [ready, stats]);

  const persistDay = useCallback((day: DayRecord) => {
    setDays((prev) => {
      const rest = prev.filter((d) => d.date !== day.date);
      return [...rest, day].sort((a, b) => a.date.localeCompare(b.date));
    });
    void db.writeDay(day);
  }, []);

  // The state updater must stay pure: React (and StrictMode in particular) can
  // invoke it more than once, which previously fired a duplicate IndexedDB write
  // per keystroke-driven mutation. Next state is computed from a ref instead.
  const daysRef = useRef(days);
  daysRef.current = days;

  const mutateDay = useCallback(async (date: string, mutator: (tasks: Task[]) => Task[]) => {
    const prev = daysRef.current;
    const existing = prev.find((d) => d.date === date) ?? emptyDay(date);
    const tasks = mutator(existing.tasks).map((task, index) => ({ ...task, order: index }));
    const updated: DayRecord = { ...existing, tasks, updatedAt: new Date().toISOString() };
    const next = [...prev.filter((d) => d.date !== date), updated].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    daysRef.current = next;
    setDays(next);
    await db.writeDay(updated);
  }, []);


  const getDay = useCallback((date: string) => days.find((d) => d.date === date), [days]);

  const value = useMemo<DisciplineContextValue>(
    () => ({
      ready,
      days,
      settings,
      achievements,
      todayKey: today,
      tomorrowKey: tomorrow,
      stats,
      getDay,
      addTask: (date, name, notes = "") =>
        mutateDay(date, (tasks) => [
          ...tasks,
          {
            id: newId(),
            name: name.trim(),
            notes: notes.trim(),
            done: false,
            completedAt: null,
            order: tasks.length,
          },
        ]),
      updateTask: (date, id, patch) =>
        mutateDay(date, (tasks) => tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      setTaskDone: (date, id, done) =>
        mutateDay(date, (tasks) =>
          tasks.map((t) =>
            t.id === id ? { ...t, done, completedAt: done ? new Date().toISOString() : null } : t,
          ),
        ),
      deleteTask: (date, id) => mutateDay(date, (tasks) => tasks.filter((t) => t.id !== id)),
      duplicateTask: (date, id) =>
        mutateDay(date, (tasks) => {
          const index = tasks.findIndex((t) => t.id === id);
          if (index === -1) return tasks;
          const source = tasks[index]!;
          const copy: Task = { ...source, id: newId(), done: false, completedAt: null };
          return [...tasks.slice(0, index + 1), copy, ...tasks.slice(index + 1)];
        }),
      reorderTasks: (date, orderedIds) =>
        mutateDay(date, (tasks) =>
          orderedIds
            .map((id) => tasks.find((t) => t.id === id))
            .filter((t): t is Task => Boolean(t)),
        ),
      updateSettings: async (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        await db.writeSettings(next);
      },
      exportData: () => ({
        app: "discipline",
        version: 1,
        exportedAt: new Date().toISOString(),
        days,
        settings,
        achievements,
      }),
      importData: async (file) => {
        const incoming = Array.isArray(file.days) ? file.days : [];
        const merged = new Map(days.map((d) => [d.date, d]));
        for (const day of incoming) merged.set(day.date, day);
        const nextDays = [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));
        const nextSettings = { ...settings, ...(file.settings ?? {}) };
        const nextAchievements = file.achievements ?? achievements;
        setDays(nextDays);
        setSettings(nextSettings);
        setAchievements(nextAchievements);
        await Promise.all([
          db.writeDays(nextDays),
          db.writeSettings(nextSettings),
          db.writeAchievements(nextAchievements),
        ]);
      },
      clearAllData: async () => {
        setDays([]);
        setAchievements({ unlocked: {} });
        await Promise.all([db.clearDays(), db.writeAchievements({ unlocked: {} })]);
      },
      resetAchievements: async () => {
        setAchievements({ unlocked: {} });
        await db.writeAchievements({ unlocked: {} });
      },
      resetStreak: async () => {
        const next = { ...settings, streakResetAt: getTodayKey() };
        setSettings(next);
        await db.writeSettings(next);
      },
    }),
    [ready, days, settings, achievements, today, tomorrow, stats, getDay, mutateDay],
  );

  // Reserved for future bulk writes triggered outside mutateDay.
  void persistDay;

  return <DisciplineContext.Provider value={value}>{children}</DisciplineContext.Provider>;
}

export function useDiscipline() {
  const context = useContext(DisciplineContext);
  if (!context) throw new Error("useDiscipline must be used inside DisciplineProvider");
  return context;
}
