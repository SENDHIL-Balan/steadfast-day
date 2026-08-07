import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { completionTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface Props {
  task: Task;
  showCompletion: boolean;
  onToggle: (done: boolean) => void;
  onEdit: (patch: { name?: string; notes?: string }) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, showCompletion, onToggle, onEdit, onDuplicate, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [notes, setNotes] = useState(task.notes);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = name.trim();
    onEdit({ name: trimmed.length > 0 ? trimmed : task.name, notes: notes.trim() });
    setEditing(false);
  };

  return (
    <motion.li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, height: 0, marginBottom: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={cn(
        "glass group relative flex items-start gap-3 rounded-2xl px-3.5 py-3 sm:px-4",
        isDragging && "z-20 scale-[1.01] shadow-2xl",
        task.done && "bg-primary/[0.06]",
      )}
    >
      <button
        type="button"
        aria-label="Reorder task"
        className="mt-1 cursor-grab touch-none text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? `Mark ${task.name} incomplete` : `Mark ${task.name} complete`}
        onClick={() => onToggle(!task.done)}
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-[0.6rem] border-2 transition-colors",
          task.done ? "border-primary bg-primary" : "border-border hover:border-primary/60",
        )}
      >
        <AnimatePresence>
          {task.done && (
            <motion.span
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
            >
              <Check className="size-4 text-primary-foreground" strokeWidth={3.2} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-full rounded-lg bg-secondary/60 px-3 py-1.5 text-sm font-medium outline-none ring-1 ring-transparent focus:ring-primary/50"
            />
            <input
              value={notes}
              placeholder="Notes (optional)"
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-full rounded-lg bg-secondary/60 px-3 py-1.5 text-xs outline-none ring-1 ring-transparent focus:ring-primary/50"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={commit}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="block w-full text-left">
            <span
              className={cn(
                "relative inline-block text-[0.95rem] font-medium leading-snug transition-colors",
                task.done && "text-muted-foreground",
              )}
            >
              {task.name}
              <motion.span
                aria-hidden
                initial={false}
                animate={{ scaleX: task.done ? 1 : 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-1/2 h-[1.5px] w-full origin-left bg-muted-foreground"
              />
            </span>
            {task.notes && (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{task.notes}</p>
            )}
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {showCompletion && task.completedAt && (
          <span className="tabular mr-1 rounded-full bg-primary/12 px-2 py-0.5 text-[0.65rem] font-medium text-primary">
            {completionTime(task.completedAt)}
          </span>
        )}
        <button
          type="button"
          aria-label="Edit task"
          onClick={() => setEditing((v) => !v)}
          className="grid size-7 place-items-center rounded-lg text-muted-foreground/60 opacity-0 transition hover:bg-secondary hover:text-foreground group-hover:opacity-100"
        >
          {editing ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
        </button>
        <button
          type="button"
          aria-label="Duplicate task"
          onClick={onDuplicate}
          className="grid size-7 place-items-center rounded-lg text-muted-foreground/60 opacity-0 transition hover:bg-secondary hover:text-foreground group-hover:opacity-100"
        >
          <Copy className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete task"
          onClick={onDelete}
          className="grid size-7 place-items-center rounded-lg text-muted-foreground/60 opacity-0 transition hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </motion.li>
  );
}
