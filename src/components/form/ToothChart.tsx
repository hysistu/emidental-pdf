"use client";

import { UPPER_TEETH, LOWER_TEETH } from "@/lib/constants";

function ToothButton({
  number,
  selected,
  onToggle,
}: {
  number: number;
  selected: boolean;
  onToggle: (n: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(number)}
      aria-pressed={selected}
      aria-label={`Dhëmb ${number}`}
      className={[
        "group relative flex h-11 w-9 flex-col items-center justify-end rounded-lg border transition-all duration-200 sm:h-12 sm:w-10",
        selected
          ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-[0_8px_20px_-12px_rgba(27,111,181,0.9)] scale-[1.04]"
          : "border-[var(--line)] bg-white/80 text-[var(--muted)] hover:border-[var(--brand)]/50 hover:bg-[var(--brand-soft)]",
      ].join(" ")}
    >
      <span
        className={[
          "mb-0.5 h-5 w-4 rounded-t-full border-x border-t opacity-70 sm:h-6 sm:w-5",
          selected ? "border-white/70 bg-white/20" : "border-current/30 bg-current/5",
        ].join(" ")}
      />
      <span className="pb-1 text-[10px] font-semibold tracking-wide sm:text-[11px]">
        {number}
      </span>
    </button>
  );
}

const QUICK_SETS = [
  { label: "Anterior sipër", teeth: [12, 11, 21, 22] },
  { label: "Anterior poshtë", teeth: [42, 41, 31, 32] },
  { label: "Full sipër", teeth: [...UPPER_TEETH] },
  { label: "Full poshtë", teeth: [...LOWER_TEETH] },
] as const;

export function ToothChart({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (teeth: number[]) => void;
}) {
  const set = new Set(selected);

  const toggle = (n: number) => {
    const next = new Set(set);
    if (next.has(n)) next.delete(n);
    else next.add(n);
    onChange([...next].sort((a, b) => a - b));
  };

  const applyQuick = (teeth: readonly number[]) => {
    const next = new Set(set);
    const allSelected = teeth.every((n) => next.has(n));
    if (allSelected) {
      for (const n of teeth) next.delete(n);
    } else {
      for (const n of teeth) next.add(n);
    }
    onChange([...next].sort((a, b) => a - b));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {QUICK_SETS.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => applyQuick(q.teeth)}
            className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 text-xs font-medium text-[var(--muted-strong)] transition hover:border-[var(--brand)]/40 hover:bg-[var(--brand-soft)]"
          >
            {q.label}
          </button>
        ))}
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
          >
            Pastro
          </button>
        ) : null}
      </div>

      <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
        Nr. Element. — prekni për të zgjedhur
      </p>
      <div className="overflow-x-auto pb-1">
        <div className="mx-auto flex min-w-max flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {UPPER_TEETH.map((n) => (
              <ToothButton
                key={n}
                number={n}
                selected={set.has(n)}
                onToggle={toggle}
              />
            ))}
          </div>
          <div className="h-px w-full max-w-xl bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
          <div className="flex gap-1.5">
            {LOWER_TEETH.map((n) => (
              <ToothButton
                key={n}
                number={n}
                selected={set.has(n)}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-[var(--muted)]">
        {selected.length === 0
          ? "Zgjidhni dhëmbët që duhen punuar"
          : `Zgjedhur (${selected.length}): ${selected.join(", ")}`}
      </p>
    </div>
  );
}
