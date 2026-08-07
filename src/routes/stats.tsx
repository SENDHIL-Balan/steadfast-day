import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo } from "react";
import { eachDayOfInterval, format, startOfYear, endOfYear, subDays, subMonths } from "date-fns";
import { Award, Flame, Target, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AnimatedCounter } from "@/components/animated-counter";
import { PageTitle, Panel } from "@/components/panel";
import { useDiscipline } from "@/hooks/use-discipline";
import { fromKey, shortDate, toKey } from "@/lib/date";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { dayProgress } from "@/lib/stats";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Statistics — Discipline Tracker" },
      {
        name: "description",
        content:
          "Streaks, weekly and yearly completion, a GitHub-style heatmap and unlocked achievements for your daily discipline.",
      },
      { property: "og:title", content: "Statistics — Discipline Tracker" },
      {
        property: "og:description",
        content: "Streaks, completion rates, graphs and achievements at a glance.",
      },
    ],
  }),
  component: StatsPage,
});

function StatCard({
  label,
  value,
  suffix = "",
  hint,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
  icon?: typeof Flame;
  delay?: number;
}) {
  return (
    <Panel delay={delay} className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className="size-4 text-primary" />}
      </div>
      <p className="tabular mt-2 text-2xl font-semibold">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Panel>
  );
}

function StatsPage() {
  const { days, todayKey, stats, achievements } = useDiscipline();
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const today = fromKey(todayKey);

  const weekly = useMemo(
    () =>
      eachDayOfInterval({ start: subDays(today, 6), end: today }).map((date) => ({
        label: format(date, "EEE"),
        percent: dayProgress(byDate.get(toKey(date))).percent,
      })),
    [byDate, today],
  );

  const monthly = useMemo(
    () =>
      eachDayOfInterval({ start: subDays(today, 29), end: today }).map((date) => ({
        label: format(date, "d MMM"),
        percent: dayProgress(byDate.get(toKey(date))).percent,
      })),
    [byDate, today],
  );

  const heatmap = useMemo(
    () =>
      eachDayOfInterval({ start: startOfYear(today), end: endOfYear(today) }).map((date) => {
        const key = toKey(date);
        const record = byDate.get(key);
        const { percent, total } = dayProgress(record);
        return { key, label: format(date, "d MMM yyyy"), percent, planned: total > 0 };
      }),
    [byDate, today],
  );

  const totalTasks = stats.totalCompleted + stats.totalMissed;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Statistics" subtitle="Consistency, measured." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Current Streak" value={stats.currentStreak} suffix=" d" icon={Flame} delay={0} />
        <StatCard label="Longest Streak" value={stats.longestStreak} suffix=" d" icon={Award} delay={0.04} />
        <StatCard label="Today" value={stats.todayPercent} suffix="%" icon={Target} delay={0.08} />
        <StatCard label="Average" value={stats.averagePercent} suffix="%" icon={TrendingUp} delay={0.12} />
        <StatCard label="This Week" value={stats.weekPercent} suffix="%" delay={0.16} />
        <StatCard label="This Month" value={stats.monthPercent} suffix="%" delay={0.2} />
        <StatCard label="This Year" value={stats.yearPercent} suffix="%" delay={0.24} />
        <StatCard label="Days Logged" value={stats.daysLogged} delay={0.28} />
        <StatCard
          label="Tasks Completed"
          value={stats.totalCompleted}
          hint={totalTasks > 0 ? `of ${totalTasks} total` : undefined}
          delay={0.32}
        />
        <StatCard label="Tasks Missed" value={stats.totalMissed} delay={0.36} />
        <Panel delay={0.4} className="p-4 sm:p-5">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Best Day
          </p>
          <p className="mt-2 text-base font-semibold">
            {stats.bestDay ? `${stats.bestDay.percent}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.bestDay ? shortDate(stats.bestDay.date) : "No data yet"}
          </p>
        </Panel>
        <Panel delay={0.44} className="p-4 sm:p-5">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Worst Day
          </p>
          <p className="mt-2 text-base font-semibold">
            {stats.worstDay ? `${stats.worstDay.percent}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.worstDay ? shortDate(stats.worstDay.date) : "No data yet"}
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel delay={0.05}>
          <h2 className="text-base font-semibold">Last 7 Days</h2>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={11} width={30} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value}%`, "Completion"]}
                />
                <Bar dataKey="percent" fill="var(--primary)" radius={[6, 6, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel delay={0.1}>
          <h2 className="text-base font-semibold">Last 30 Days</h2>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="monthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} interval={6} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={11} width={30} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value}%`, "Completion"]}
                />
                <Area
                  type="monotone"
                  dataKey="percent"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#monthFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel delay={0.05}>
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold">{format(today, "yyyy")} Heatmap</h2>
          <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
            <span>Less</span>
            {[0.12, 0.35, 0.6, 0.85, 1].map((opacity) => (
              <span
                key={opacity}
                className="size-2.5 rounded-[3px]"
                style={{ background: "var(--primary)", opacity }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto pb-2">
          <div
            className="grid w-max grid-flow-col gap-[3px]"
            style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
          >
            {heatmap.map((cell, index) => (
              <motion.span
                key={cell.key}
                title={`${cell.label} — ${cell.planned ? `${cell.percent}%` : "not planned"}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.0012, 0.6), duration: 0.25 }}
                className="size-[11px] rounded-[3px]"
                style={{
                  background: cell.planned ? "var(--primary)" : "var(--color-border)",
                  opacity: cell.planned ? Math.max(0.16, cell.percent / 100) : 0.5,
                }}
              />
            ))}
          </div>
        </div>
      </Panel>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Achievements</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((achievement, index) => {
            const { value, target } = achievement.progress(stats);
            const unlockedAt = achievements.unlocked[achievement.id];
            const unlocked = Boolean(unlockedAt);
            const ratio = Math.min(1, value / target);
            return (
              <Panel
                key={achievement.id}
                delay={index * 0.03}
                className={cn("p-4", unlocked ? "ring-1 ring-primary/30" : "opacity-80")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{achievement.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-xl",
                      unlocked ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Award className="size-4" />
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ratio * 100}%` }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <p className="tabular mt-2 text-[0.65rem] text-muted-foreground">
                  {unlocked
                    ? `Unlocked ${shortDate(unlockedAt.slice(0, 10))}`
                    : `${Math.min(value, target)} / ${target}`}
                </p>
              </Panel>
            );
          })}
        </div>
      </section>
    </div>
  );
}
