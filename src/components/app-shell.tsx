import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BarChart3,
  CalendarDays,
  Flame,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useDiscipline } from "@/hooks/use-discipline";

const NAV = [
  { to: "/", label: "Today", icon: Target },
  { to: "/tomorrow", label: "Tomorrow", icon: Moon },
  { to: "/history", label: "History", icon: CalendarDays },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings, stats } = useDiscipline();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-28 pt-5 sm:px-6 md:pb-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25 transition-transform group-hover:scale-105">
            <Target className="size-4.5" strokeWidth={2.4} />
          </span>
          <span className="text-[0.95rem] font-semibold tracking-tight">Discipline</span>
        </Link>

        <nav className="glass hidden items-center gap-1 rounded-full p-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="glass hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium sm:flex">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="tabular">{stats.currentStreak}</span>
            <span className="text-muted-foreground">day streak</span>
          </span>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() =>
              void updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" })
            }
            className="glass grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            {settings.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="glass-strong fixed inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-2xl p-1.5 md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[0.65rem] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill-mobile"
                  className="absolute inset-0 rounded-xl bg-primary/12"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="relative size-4.5" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
