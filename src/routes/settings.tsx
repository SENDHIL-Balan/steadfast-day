import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bell, Download, Palette, RotateCcw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageTitle, Panel } from "@/components/panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useDiscipline } from "@/hooks/use-discipline";
import {
  notificationPermission,
  requestNotificationPermission,
  scheduleReminders,
} from "@/lib/notifications";
import { ACCENTS, type AccentId, type BackupFile } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Discipline Tracker" },
      {
        name: "description",
        content:
          "Theme, accent colour, reminders, JSON backup and restore, and destructive resets for your local discipline data.",
      },
      { property: "og:title", content: "Settings — Discipline Tracker" },
      {
        property: "og:description",
        content: "Theme, accent, reminders and local data backup controls.",
      },
    ],
  }),
  component: SettingsPage,
});

type DangerAction = "clear" | "achievements" | "streak" | null;

function SettingsPage() {
  const { settings, updateSettings, exportData, importData, clearAllData, resetAchievements, resetStreak } =
    useDiscipline();
  const [danger, setDanger] = useState<DangerAction>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings.notificationsEnabled) {
      scheduleReminders({ morning: settings.morningReminder, night: settings.nightReminder });
    }
  }, [settings.notificationsEnabled, settings.morningReminder, settings.nightReminder]);

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        toast.error("Notifications blocked by the browser.");
        return;
      }
    }
    await updateSettings({ notificationsEnabled: enabled });
    toast.success(enabled ? "Reminders enabled." : "Reminders disabled.");
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `discipline-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exported.");
  };

  const handleImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as BackupFile;
      if (parsed.app !== "discipline" || !Array.isArray(parsed.days)) {
        throw new Error("Unrecognised backup file");
      }
      await importData(parsed);
      toast.success("Backup restored.");
    } catch (error) {
      console.error(error);
      toast.error("That file is not a valid Discipline backup.");
    }
  };

  const runDanger = async () => {
    if (danger === "clear") {
      await clearAllData();
      toast.success("All data cleared.");
    } else if (danger === "achievements") {
      await resetAchievements();
      toast.success("Achievements reset.");
    } else if (danger === "streak") {
      await resetStreak();
      toast.success("Streak reset.");
    }
    setDanger(null);
  };

  const dangerCopy: Record<Exclude<DangerAction, null>, { title: string; body: string }> = {
    clear: {
      title: "Clear all data?",
      body: "Every logged day, task, note and achievement will be permanently deleted from this device. This cannot be undone.",
    },
    achievements: {
      title: "Reset achievements?",
      body: "All unlocked achievements will be locked again. They can re-unlock as your stats qualify.",
    },
    streak: {
      title: "Reset streak?",
      body: "Your current and longest streak will start counting from today.",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Settings" subtitle="Everything is stored locally on this device." />

      <Panel>
        <h2 className="text-base font-semibold">Appearance</h2>
        <div className="mt-4 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Dark by default. Light when you need it.</p>
            </div>
            <div className="flex rounded-xl bg-secondary p-1">
              {(["dark", "light"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => void updateSettings({ theme: mode })}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition",
                    settings.theme === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Palette className="size-3.5 text-primary" /> Accent colour
              </p>
              <p className="text-xs text-muted-foreground">Colours the ring, charts and highlights.</p>
            </div>
            <div className="flex gap-2">
              {(Object.keys(ACCENTS) as AccentId[]).map((id) => {
                const accent = ACCENTS[id];
                return (
                  <button
                    key={id}
                    type="button"
                    aria-label={accent.label}
                    onClick={() => void updateSettings({ accent: id })}
                    className={cn(
                      "size-7 rounded-full transition",
                      settings.accent === id
                        ? "ring-2 ring-foreground/60 ring-offset-2 ring-offset-background"
                        : "hover:scale-110",
                    )}
                    style={{ background: `oklch(${accent.l} ${accent.c} ${accent.h})` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      <Panel delay={0.05}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Bell className="size-4 text-primary" /> Notifications
        </h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Daily reminders</p>
            <p className="text-xs text-muted-foreground">
              Morning: “Your mission starts now.” · Night: “Plan tomorrow before sleeping.”
            </p>
          </div>
          <Switch
            checked={settings.notificationsEnabled}
            onCheckedChange={(checked) => void toggleNotifications(checked)}
          />
        </div>
        <div className="mt-5 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Morning reminder
            <input
              type="time"
              value={settings.morningReminder}
              onChange={(e) => void updateSettings({ morningReminder: e.target.value })}
              className="rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Night reminder
            <input
              type="time"
              value={settings.nightReminder}
              onChange={(e) => void updateSettings({ nightReminder: e.target.value })}
              className="rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground outline-none"
            />
          </label>
        </div>
        {notificationPermission() === "denied" && (
          <p className="mt-3 text-xs text-destructive">
            Notifications are blocked in your browser settings for this site.
          </p>
        )}
      </Panel>

      <Panel delay={0.1}>
        <h2 className="text-base font-semibold">Backup</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your data never leaves this device. Export a JSON file to keep it safe.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Download className="size-4" /> Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold transition hover:bg-accent"
          >
            <Upload className="size-4" /> Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImport(file);
              e.target.value = "";
            }}
          />
        </div>
      </Panel>

      <Panel delay={0.15} className="ring-1 ring-destructive/25">
        <h2 className="text-base font-semibold text-destructive">Danger zone</h2>
        <div className="mt-4 flex flex-col divide-y divide-hairline">
          {[
            { id: "streak" as const, label: "Reset streak", hint: "Start streak counting from today.", icon: RotateCcw },
            { id: "achievements" as const, label: "Reset achievements", hint: "Lock all achievements again.", icon: RotateCcw },
            { id: "clear" as const, label: "Clear all data", hint: "Delete every day, task and achievement.", icon: Trash2 },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.hint}</p>
              </div>
              <button
                type="button"
                onClick={() => setDanger(item.id)}
                className="flex items-center gap-2 rounded-xl bg-destructive/12 px-3.5 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/20"
              >
                <item.icon className="size-3.5" /> Reset
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <AlertDialog open={danger !== null} onOpenChange={(open) => !open && setDanger(null)}>
        <AlertDialogContent className="glass-strong rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{danger ? dangerCopy[danger].title : ""}</AlertDialogTitle>
            <AlertDialogDescription>{danger ? dangerCopy[danger].body : ""}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void runDanger()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
