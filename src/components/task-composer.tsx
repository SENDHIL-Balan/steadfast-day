import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

interface FormValues {
  name: string;
  notes: string;
}

interface Props {
  placeholder?: string;
  onAdd: (name: string, notes: string) => void;
}

export function TaskComposer({ placeholder = "Add a task…", onAdd }: Props) {
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: { name: "", notes: "" },
  });
  const name = watch("name");

  const submit = handleSubmit((values) => {
    if (!values.name.trim()) return;
    onAdd(values.name, values.notes);
    reset({ name: "", notes: "" });
  });

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-2.5 sm:p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-[0.6rem] border-2 border-dashed border-border text-muted-foreground">
          <Plus className="size-3.5" />
        </span>
        <input
          {...register("name")}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[0.95rem] font-medium outline-none placeholder:text-muted-foreground/70"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-xl bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-30"
        >
          Add
        </button>
      </div>
      {name.trim().length > 0 && (
        <input
          {...register("notes")}
          placeholder="Notes (optional)"
          className="mt-2 w-full rounded-lg bg-secondary/50 px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/70"
        />
      )}
    </form>
  );
}
