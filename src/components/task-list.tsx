import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence } from "motion/react";

import { TaskItem } from "@/components/task-item";
import type { Task } from "@/lib/types";

interface Props {
  tasks: Task[];
  showCompletion?: boolean;
  onReorder: (ids: string[]) => void;
  onToggle: (id: string, done: boolean) => void;
  onEdit: (id: string, patch: { name?: string; notes?: string }) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({
  tasks,
  showCompletion = true,
  onReorder,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = tasks.findIndex((t) => t.id === active.id);
    const to = tasks.findIndex((t) => t.id === over.id);
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(tasks, from, to).map((t) => t.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                showCompletion={showCompletion}
                onToggle={(done) => onToggle(task.id, done)}
                onEdit={(patch) => onEdit(task.id, patch)}
                onDuplicate={() => onDuplicate(task.id)}
                onDelete={() => onDelete(task.id)}
              />
            ))}
          </AnimatePresence>
        </ul>
      </SortableContext>
    </DndContext>
  );
}
