"use client";

import { useId, useState } from "react";

const ACCEPT =
  ".stl,.ply,model/stl,model/ply,application/sla,application/vnd.ms-pki.stl";
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

function scanExt(file: File): "stl" | "ply" | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".stl")) return "stl";
  if (name.endsWith(".ply")) return "ply";
  const type = file.type.toLowerCase();
  if (
    type === "model/stl" ||
    type === "application/sla" ||
    type === "application/vnd.ms-pki.stl"
  ) {
    return "stl";
  }
  if (type === "model/ply" || type === "application/ply") return "ply";
  // Browsers often leave scan files as octet-stream — allow if we can't tell
  if (type === "application/octet-stream" || type === "") return null;
  return null;
}

function isScanFile(file: File) {
  const ext = scanExt(file);
  if (ext) return true;
  // octet-stream / empty type: require extension already handled; reject others
  const name = file.name.toLowerCase();
  return name.endsWith(".stl") || name.endsWith(".ply");
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function StlUploadField({
  label,
  hint,
  file,
  onChange,
  error,
}: {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}) {
  const inputId = useId();
  const [localError, setLocalError] = useState<string | null>(null);
  const fileExt = file ? scanExt(file) ?? (file.name.split(".").pop()?.toUpperCase() || "SCAN") : null;

  const onPick = (list: FileList | null) => {
    const next = list?.[0] ?? null;
    if (!next) {
      setLocalError(null);
      onChange(null);
      return;
    }
    if (!isScanFile(next)) {
      setLocalError("Zgjidhni një skedar .STL ose .PLY");
      onChange(null);
      return;
    }
    if (next.size > MAX_BYTES) {
      setLocalError("Skedari duhet të jetë ≤ 50 MB");
      onChange(null);
      return;
    }
    setLocalError(null);
    onChange(next);
  };

  return (
    <div data-error={error ? "true" : undefined}>
      <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--muted-strong)]">
        <span>{label}</span>
        <span className="text-[11px] font-normal text-[var(--muted)]">opsionale</span>
      </div>
      {hint ? <p className="mb-2 text-xs text-[var(--muted)]">{hint}</p> : null}

      {file ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--ink)]">{file.name}</p>
            <p className="text-xs text-[var(--muted)]">
              {typeof fileExt === "string" ? fileExt.toUpperCase() : "SCAN"} ·{" "}
              {formatSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              onChange(null);
            }}
            className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
          >
            Hiq
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--line)] bg-white/60 px-4 py-7 text-center transition hover:border-[var(--brand)]/40 hover:bg-[var(--brand-soft)]/50"
        >
          <span className="text-sm font-medium text-[var(--muted-strong)]">
            Ngarko skanim
          </span>
          <span className="text-xs text-[var(--muted)]">.stl ose .ply · max 50 MB</span>
          <input
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              onPick(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
      {error || localError ? (
        <p className="mt-1.5 text-sm text-red-500">{error || localError}</p>
      ) : null}
    </div>
  );
}

export { MAX_BYTES as STL_MAX_BYTES };
