"use client";

import { UPPER_TEETH, LOWER_TEETH } from "@/lib/constants";
import {
  bridgeableRuns,
  formatTeethSummary,
  isContiguousBridge,
  normalizeBridges,
} from "@/lib/teeth";

function toothInBridge(bridges: number[][], n: number) {
  return bridges.some((b) => b.includes(n));
}

function sameBridge(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((n) => set.has(n));
}

function ToothButton({
  number,
  selected,
  bridged,
  connectLeft,
  connectRight,
  onToggle,
}: {
  number: number;
  selected: boolean;
  bridged: boolean;
  connectLeft: boolean;
  connectRight: boolean;
  onToggle: (n: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(number)}
      aria-pressed={selected}
      aria-label={`Dhëmb ${number}${bridged ? ", urë" : ""}`}
      className={[
        "group relative flex h-11 w-9 flex-col items-center justify-end rounded-lg border transition-all duration-200 sm:h-12 sm:w-10",
        selected
          ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-[0_8px_20px_-12px_rgba(27,111,181,0.9)] scale-[1.04]"
          : "border-[var(--line)] bg-white/80 text-[var(--muted)] hover:border-[var(--brand)]/50 hover:bg-[var(--brand-soft)]",
      ].join(" ")}
    >
      {bridged && connectLeft ? (
        <span
          aria-hidden
          className="absolute top-2.5 -left-[7px] z-10 h-0.5 w-[7px] bg-amber-400 sm:top-3 sm:-left-2 sm:w-2"
        />
      ) : null}
      {bridged && connectRight ? (
        <span
          aria-hidden
          className="absolute top-2.5 -right-[7px] z-10 h-0.5 w-[7px] bg-amber-400 sm:top-3 sm:-right-2 sm:w-2"
        />
      ) : null}
      {bridged ? (
        <span
          aria-hidden
          className="absolute -top-1 left-1/2 z-20 size-2 -translate-x-1/2 rounded-full bg-amber-400 ring-2 ring-white shadow-sm"
          title="Urë"
        />
      ) : null}
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
  { label: "Anterior sipër", teeth: [13, 12, 11, 21, 22, 23] },
  { label: "Anterior poshtë", teeth: [43, 42, 41, 31, 32, 33] },
  { label: "Posterior sipër", teeth: [18, 17, 16, 15, 14, 24, 25, 26, 27, 28] },
  { label: "Posterior poshtë", teeth: [48, 47, 46, 45, 44, 34, 35, 36, 37, 38] },
  { label: "Full sipër", teeth: [...UPPER_TEETH] },
  { label: "Full poshtë", teeth: [...LOWER_TEETH] },
] as const;

function ArchRow({
  teeth,
  selected,
  bridges,
  onToggle,
}: {
  teeth: readonly number[];
  selected: Set<number>;
  bridges: number[][];
  onToggle: (n: number) => void;
}) {
  const bridgeOf = (n: number) => bridges.find((b) => b.includes(n));

  return (
    <div className="flex gap-1.5">
      {teeth.map((n, i) => {
        const bridge = bridgeOf(n);
        const bridged = Boolean(bridge);
        const left = i > 0 ? teeth[i - 1] : null;
        const right = i < teeth.length - 1 ? teeth[i + 1] : null;
        const connectLeft = Boolean(bridged && left != null && bridge!.includes(left));
        const connectRight = Boolean(bridged && right != null && bridge!.includes(right));

        return (
          <ToothButton
            key={n}
            number={n}
            selected={selected.has(n)}
            bridged={bridged}
            connectLeft={connectLeft}
            connectRight={connectRight}
            onToggle={onToggle}
          />
        );
      })}
    </div>
  );
}

export function ToothChart({
  selected,
  bridges,
  onChange,
}: {
  selected: number[];
  bridges: number[][];
  onChange: (teeth: number[], bridges: number[][]) => void;
}) {
  const set = new Set(selected);
  const linkableRuns = bridgeableRuns(selected).filter(
    (run) => !bridges.some((b) => sameBridge(b, run)),
  );
  const canBridge = linkableRuns.length > 0;
  const selectionIsOneBridge =
    isContiguousBridge(selected) &&
    bridges.some((b) => sameBridge(b, selected));
  const selectionOverlapsBridge = selected.some((n) => toothInBridge(bridges, n));
  const summaryLines = formatTeethSummary(selected, bridges);

  const toggle = (n: number) => {
    const next = new Set(set);
    if (next.has(n)) next.delete(n);
    else next.add(n);
    const teeth = [...next].sort((a, b) => a - b);
    onChange(teeth, normalizeBridges(bridges, teeth));
  };

  const applyQuick = (teeth: readonly number[]) => {
    const next = new Set(set);
    const allSelected = teeth.every((n) => next.has(n));
    if (allSelected) {
      for (const n of teeth) next.delete(n);
    } else {
      for (const n of teeth) next.add(n);
    }
    const nextTeeth = [...next].sort((a, b) => a - b);
    onChange(nextTeeth, normalizeBridges(bridges, nextTeeth));
  };

  const linkBridge = () => {
    const runs = bridgeableRuns(selected);
    if (runs.length === 0) return;

    // Drop overlapping bridges, then add only contiguous neighbor runs
    const touched = new Set(runs.flat());
    const nextBridges = bridges.filter((b) => !b.some((n) => touched.has(n)));
    for (const run of runs) {
      if (!nextBridges.some((b) => sameBridge(b, run))) {
        nextBridges.push(run);
      }
    }
    onChange(selected, nextBridges);
  };

  const unlinkBridge = () => {
    const nextBridges = bridges.filter((b) => !b.some((n) => set.has(n)));
    onChange(selected, nextBridges);
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
        {canBridge && !selectionIsOneBridge ? (
          <button
            type="button"
            onClick={linkBridge}
            className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
          >
            Lidh urë
            {linkableRuns.length === 1
              ? ` (${linkableRuns[0].join("–")})`
              : ` (${linkableRuns.length})`}
          </button>
        ) : null}
        {selectionOverlapsBridge ? (
          <button
            type="button"
            onClick={unlinkBridge}
            className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
          >
            Hiq urën
          </button>
        ) : null}
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([], [])}
            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
          >
            Pastro
          </button>
        ) : null}
      </div>

      <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
        Nr. Element. — urë vetëm për dhëmbë fqinjë
      </p>
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="mx-auto flex min-w-max flex-col items-center gap-3">
          <ArchRow
            teeth={UPPER_TEETH}
            selected={set}
            bridges={bridges}
            onToggle={toggle}
          />
          <div className="h-px w-full max-w-xl bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
          <ArchRow
            teeth={LOWER_TEETH}
            selected={set}
            bridges={bridges}
            onToggle={toggle}
          />
        </div>
      </div>
      {selected.length === 0 ? (
        <p className="text-center text-sm text-[var(--muted)]">
          Zgjidhni dhëmbët që duhen punuar
        </p>
      ) : (
        <div className="space-y-1 text-center text-sm">
          <p className="text-[var(--muted)]">
            Zgjedhur ({selected.length}): {selected.join(", ")}
          </p>
          {summaryLines.map((line) => (
            <p
              key={line}
              className={
                line.startsWith("Urë")
                  ? "text-amber-700"
                  : "text-[var(--muted-strong)]"
              }
            >
              {line}
            </p>
          ))}
          {selected.length >= 2 && linkableRuns.length === 0 && !selectionOverlapsBridge ? (
            <p className="text-xs text-[var(--muted)]">
              Për urë zgjidhni dhëmbë njërin pas tjetrit (pa boshllëk)
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
