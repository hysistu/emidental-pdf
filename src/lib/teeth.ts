import { UPPER_TEETH, LOWER_TEETH } from "@/lib/constants";

const ARCHES: readonly (readonly number[])[] = [UPPER_TEETH, LOWER_TEETH];

/** Contiguous runs of selected teeth on the same arch (chart order). */
export function contiguousRuns(teeth: number[]): number[][] {
  const set = new Set(teeth);
  const runs: number[][] = [];

  for (const arch of ARCHES) {
    let run: number[] = [];
    for (const n of arch) {
      if (set.has(n)) {
        run.push(n);
      } else if (run.length) {
        runs.push(run);
        run = [];
      }
    }
    if (run.length) runs.push(run);
  }

  return runs;
}

/** Runs of 2+ neighbors that can become bridges. */
export function bridgeableRuns(teeth: number[]): number[][] {
  return contiguousRuns(teeth).filter((run) => run.length >= 2);
}

/** True if all teeth form one contiguous block on the same arch. */
export function isContiguousBridge(teeth: number[]): boolean {
  if (teeth.length < 2) return false;
  const runs = contiguousRuns(teeth);
  return runs.length === 1 && runs[0].length === teeth.length;
}

/**
 * Keep only valid bridges: same arch, neighbors only, still selected.
 * Non-contiguous groups are split into contiguous runs of 2+.
 */
export function normalizeBridges(
  bridges: number[][],
  selected: number[],
): number[][] {
  const set = new Set(selected);
  const next: number[][] = [];
  const seen = new Set<string>();

  for (const bridge of bridges) {
    const kept = bridge.filter((n) => set.has(n));
    for (const run of bridgeableRuns(kept)) {
      const key = run.join("-");
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(run);
    }
  }

  return next;
}

/** Split selected teeth into bridge groups vs solo (no bridge). */
export function splitTeethByBridge(
  selected: number[],
  bridges: number[][] = [],
) {
  const bridged = new Set(bridges.flat());
  const solo = selected
    .filter((n) => !bridged.has(n))
    .sort((a, b) => a - b);
  const bridgeGroups = bridges.map((b) => [...b]);
  return { solo, bridgeGroups };
}

/** One line per solo block / each bridge — used in form + PDF design. */
export function formatTeethSummary(
  selected: number[],
  bridges: number[][] = [],
) {
  const { solo, bridgeGroups } = splitTeethByBridge(selected, bridges);
  const parts: string[] = [];
  if (solo.length) {
    parts.push(`Solo (${solo.length}): ${solo.join(", ")}`);
  }
  bridgeGroups.forEach((group, i) => {
    const n = bridgeGroups.length === 1 ? "Urë" : `Urë ${i + 1}`;
    parts.push(`${n} (${group.length}): ${group.join("–")}`);
  });
  return parts;
}
