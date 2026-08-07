import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  format,
  getDay as weekdayOf,
  startOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";

import { PageTitle, Panel } from "@/components/panel";
import { useDiscipline } from "@/hooks/use-discipline";
import { completionTime, fromKey, prettyDate, toKey } from "@/lib/date";
import { dayProgress, dayStatus, type DayStatus } from "@/lib/stats";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Discipline Tracker" },
      {
        name: "description",
        content:
          "Every logged day, kept forever. Browse a colour-coded calendar and reopen any day's tasks, notes and completion times.",
      },
      { property: "og:title", content: "History — Discipline Tracker" },
      {
        property: "og:description",
        content: "A colour-coded calendar of every day you have logged.",
      },
    ],
  }),
  component: HistoryPage,
});

const STATUS_STYLE: Record<DayStatus, string> = {
  complete: "bg-success/85 text-background border-transparent",
  partial: "bg-warning/80 text-background border-transparent",
  missed: "bg-danger/80 text-background border-transparent",
  empty: "bg-transparent text-muted-foreground/60 border-border",
};

const LEGEND: { status: DayStatus; label: string }[] = [
  { status: "complete", label: "100% completed" },
  { status: "partial", label: "Partially completed" },
  { status: "missed", label: "Missed" },
  { status: "empty", label: "Not planned" },
];

function HistoryPage() {
  const { days, todayKey } = useDiscipline();
  const [cursor, setCursor] = useState(() => startOfMonth(fromKey(todayKey)));
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const grid = useMemo(() => {
    const start = startOfMonth(cursor);
    const cells = eachDayOfInterval({ start, end: endOfMonth(cursor) });
    const lead = (weekdayOf(start) + 6) % 7; // Monday-first
    return { cells, lead };
  }, [cursor]);

  const selectedDay = selected ? byDate.get(selected) : undefined;
  const selectedProgress = dayProgress(selectedDay);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="History" subtitle="Every day you have logged, stored forever." />

      <Panel>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{format(cursor, "MMMM yyyy")}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCursor((c) => addMonths(c, -1))}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCursor(startOfMonth(fromKey(todayKey)))}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              Today
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d} className="py-1">
              {d.slice(0, 1)}
            </span>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {Array.from({ length: grid.lead }).map((_, i) => (
            <span key={`lead-${i}`} />
          ))}
          {grid.cells.map((date, index) => {
            const key = toKey(date);
            const record = byDate.get(key);
            const status = dayStatus(record);
            const isToday = key === todayKey;
            return (
              <motion.button
                key={key}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.008, duration: 0.3 }}
                whileHover={{ scale: 1.06 }}
                onClick={() => setSelected(key)}
                className={cn(
                  "tabular relative aspect-square rounded-xl border text-xs font-semibold transition-colors",
                  STATUS_STYLE[status],
                  isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                {format(date, "d")}
                {record && record.tasks.length > 0 && (
                  <span className="absolute inset-x-0 bottom-1 text-[0.55rem] font-medium opacity-80">
                    {dayProgress(record).percent}%
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-hairline pt-4">
          {LEGEND.map((item) => (
            <span
              key={item.status}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span className={cn("size-3 rounded-full border", STATUS_STYLE[item.status])} />
              {item.label}
            </span>
          ))}
        </div>
      </Panel>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong max-h-[80dvh] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{prettyDate(selected)}</h3>
                  <p className="tabular mt-1 text-sm text-muted-foreground">
                    {selectedProgress.total === 0
                      ? "Nothing was planned for this day."
                      : `${selectedProgress.percent}% completed · ${selectedProgress.completed}/${selectedProgress.total} tasks`}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setSelected(null)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {selectedProgress.total > 0 && (
                <ul className="mt-5 flex flex-col gap-2">
                  {selectedDay?.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start gap-3 rounded-2xl bg-secondary/45 px-3.5 py-3"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2",
                          task.done ? "border-success bg-success" : "border-border",
                        )}
                      >
                        {task.done && (
                          <Check className="size-3 text-background" strokeWidth={3.4} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            task.done && "text-muted-foreground line-through",
                          )}
                        >
                          {task.name}
                        </p>
                        {task.notes && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{task.notes}</p>
                        )}
                      </div>
                      {task.completedAt && (
                        <span className="tabular rounded-full bg-success/15 px-2 py-0.5 text-[0.65rem] font-medium text-success">
                          {completionTime(task.completedAt)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
