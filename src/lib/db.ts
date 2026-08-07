import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import {
  DEFAULT_SETTINGS,
  type AchievementState,
  type DayRecord,
  type Settings,
} from "@/lib/types";

interface DisciplineDB extends DBSchema {
  days: { key: string; value: DayRecord };
  meta: { key: string; value: unknown };
}

const DB_NAME = "discipline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DisciplineDB>> | null = null;

function getDB() {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB unavailable");
  }
  if (!dbPromise) {
    dbPromise = openDB<DisciplineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("days")) {
          db.createObjectStore("days", { keyPath: "date" });
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta");
        }
      },
    });
  }
  return dbPromise;
}

export async function readAllDays(): Promise<DayRecord[]> {
  const db = await getDB();
  const days = await db.getAll("days");
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

export async function writeDay(day: DayRecord): Promise<void> {
  const db = await getDB();
  await db.put("days", day);
}

export async function writeDays(days: DayRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("days", "readwrite");
  await Promise.all(days.map((day) => tx.store.put(day)));
  await tx.done;
}

export async function deleteDay(date: string): Promise<void> {
  const db = await getDB();
  await db.delete("days", date);
}

export async function clearDays(): Promise<void> {
  const db = await getDB();
  await db.clear("days");
}

export async function readSettings(): Promise<Settings> {
  const db = await getDB();
  const stored = (await db.get("meta", "settings")) as Partial<Settings> | undefined;
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export async function writeSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put("meta", settings, "settings");
}

export async function readAchievements(): Promise<AchievementState> {
  const db = await getDB();
  const stored = (await db.get("meta", "achievements")) as AchievementState | undefined;
  return stored ?? { unlocked: {} };
}

export async function writeAchievements(state: AchievementState): Promise<void> {
  const db = await getDB();
  await db.put("meta", state, "achievements");
}
