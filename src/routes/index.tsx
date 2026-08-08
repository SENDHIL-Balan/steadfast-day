import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { PartyPopper } from "lucide-react";

import { Panel } from "@/components/panel";
import { ProgressRing } from "@/components/progress-ring";
import { TaskComposer } from "@/components/task-composer";
import { TaskList } from "@/components/task-list";
import { useClock } from "@/hooks/use-clock";
import { useDiscipline } from "@/hooks/use-discipline";
import { celebrate } from "@/lib/confetti";
import { clockTime, greeting, prettyDate } from "@/lib/date";
import { quoteForDay } from "@/lib/quotes";
import { dayProgress } from "@/lib/stats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Discipline Tracker" },
      {
        name: "description",
        content:
          "Your daily mission board. Track every mandatory task, watch your progress ring fill, and keep the streak alive.",
      },
      { property: "og:title", content: "Today — Discipline Tracker" },
      {
        property: "og:description",
        content: "Your daily mission board for manual, equal-priority discipline tracking.",
      },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const {
    ready,
    todayKey,
    getDay,
    addTask,
    updateTask,
    setTaskDone,
    deleteTask,
    duplicateTask,
    reorderTasks,
  } = useDiscipline();
  const now = useClock();
  const day = getDay(todayKey);
  const { total, completed, percent } = dayProgress(day);
  const quote = quoteForDay(todayKey);
  const allDone = total > 0 && completed === total;
  const celebrated = useRef(false);

  useEffect(() => {
    if (allDone && !celebrated.current) {
      celebrated.current = true;
      celebrate();
    }
    if (!allDone) celebrated.current = false;
  }, [allDone]);

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-sm font-medium text-primary">{now ? greeting(now) : "Welcome"}</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
          {now ? format(now, "EEEE") : "Today"}
          <span className="text-muted-foreground">
            {now ? `, ${format(now, "d MMMM yyyy")}` : ""}
          </span>
        </h1>
        <p className="tabular mt-2 text-sm text-muted-foreground">
          {now ? clockTime(now) : "--:--:--"}
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <Panel delay={0.05} className="flex flex-col items-center gap-4 text-center">
            <ProgressRing completed={completed} total={total} percent={percent} />
            <p className="max-w-sm text-sm text-muted-foreground">
              {total === 0
                ? "No mission planned for today. Add tasks below, or plan tomorrow tonight."
                : `You have completed ${percent}% of today's mission.`}
            </p>
            <AnimatePresence>
              {allDone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="w-full rounded-2xl bg-primary/12 px-5 py-4 ring-1 ring-primary/25"
                >
                  <p className="flex items-center justify-center gap-2 text-lg font-semibold">
                    <PartyPopper className="h-5 w-5 text-primary" />
                    Mission Complete.
                  </p>
                  <p className="text-sm text-muted-foreground">Excellent work.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>
        </div>

        <Panel delay={0.1} className="flex flex-col justify-center">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Today's reminder
          </p>
          <blockquote className="mt-3 text-[1.05rem] font-medium leading-relaxed">
            “{quote.text}”
          </blockquote>
          <p className="mt-3 text-xs text-muted-foreground">— {quote.author}</p>
        </Panel>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Today's Tasks</h2>
          <span className="tabular text-xs text-muted-foreground">
            {completed} of {total} done
          </span>
        </div>

        {!ready ? (
          <div className="glass h-24 animate-pulse rounded-2xl" />
        ) : (
          <>
            {total > 0 && (
              <TaskList
                tasks={day?.tasks ?? []}
                onReorder={(ids) => void reorderTasks(todayKey, ids)}
                onToggle={(id, done) => void setTaskDone(todayKey, id, done)}
                onEdit={(id, patch) => void updateTask(todayKey, id, patch)}
                onDuplicate={(id) => void duplicateTask(todayKey, id)}
                onDelete={(id) => void deleteTask(todayKey, id)}
              />
            )}
            <TaskComposer
              placeholder="Add a task for today…"
              onAdd={(name, notes) => void addTask(todayKey, name, notes)}
            />
          </>
        )}
      </section>
    </div>
  );
}
