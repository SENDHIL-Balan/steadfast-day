import { createFileRoute } from "@tanstack/react-router";
import { Moon } from "lucide-react";

import { Panel, PageTitle } from "@/components/panel";
import { TaskComposer } from "@/components/task-composer";
import { TaskList } from "@/components/task-list";
import { useDiscipline } from "@/hooks/use-discipline";
import { prettyDate } from "@/lib/date";

export const Route = createFileRoute("/tomorrow")({
  head: () => ({
    meta: [
      { title: "Plan Tomorrow — Discipline Tracker" },
      {
        name: "description",
        content:
          "Write tomorrow's mission tonight. Tasks stay hidden until midnight, then become your day.",
      },
      { property: "og:title", content: "Plan Tomorrow — Discipline Tracker" },
      {
        property: "og:description",
        content: "Write tomorrow's mission tonight; it activates automatically at midnight.",
      },
    ],
  }),
  component: TomorrowPage,
});

function TomorrowPage() {
  const {
    ready,
    tomorrowKey,
    getDay,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    reorderTasks,
    setTaskDone,
  } = useDiscipline();
  const day = getDay(tomorrowKey);
  const tasks = day?.tasks ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Tomorrow" subtitle={prettyDate(tomorrowKey)} />

      <Panel className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <Moon className="size-4.5" />
        </span>
        <div>
          <p className="text-sm font-medium">Plan tonight, execute tomorrow.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            These tasks stay out of Today until midnight. At 12:00 AM they become your mission and a
            fresh Tomorrow opens automatically.
          </p>
        </div>
      </Panel>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Tomorrow's Tasks</h2>
          <span className="tabular text-xs text-muted-foreground">{tasks.length} planned</span>
        </div>

        {!ready ? (
          <div className="glass h-24 animate-pulse rounded-2xl" />
        ) : (
          <>
            {tasks.length > 0 && (
              <TaskList
                tasks={tasks}
                showCompletion={false}
                onReorder={(ids) => void reorderTasks(tomorrowKey, ids)}
                onToggle={(id, done) => void setTaskDone(tomorrowKey, id, done)}
                onEdit={(id, patch) => void updateTask(tomorrowKey, id, patch)}
                onDuplicate={(id) => void duplicateTask(tomorrowKey, id)}
                onDelete={(id) => void deleteTask(tomorrowKey, id)}
              />
            )}
            <TaskComposer
              placeholder="Add a task for tomorrow…"
              onAdd={(name, notes) => void addTask(tomorrowKey, name, notes)}
            />
          </>
        )}
      </section>
    </div>
  );
}
