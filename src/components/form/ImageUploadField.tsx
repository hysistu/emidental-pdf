"use client";

import { useEffect, useId, useState } from "react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function ImageUploadField({
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
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPick = (list: FileList | null) => {
    const next = list?.[0] ?? null;
    if (!next) {
      setLocalError(null);
      onChange(null);
      return;
    }
    if (!next.type.startsWith("image/")) {
      setLocalError("Zgjidhni një foto (JPG, PNG, WEBP)");
      onChange(null);
      return;
    }
    if (next.size > MAX_BYTES) {
      setLocalError("Fotoja duhet të jetë ≤ 5 MB");
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

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="h-40 w-full object-cover"
          />
          <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] px-3 py-2">
            <p className="truncate text-xs text-[var(--muted)]">
              {file?.name} · {file ? `${(file.size / 1024).toFixed(0)} KB` : ""}
            </p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
            >
              Hiq
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--line)] bg-white/60 px-4 py-8 text-center transition hover:border-[var(--brand)]/40 hover:bg-[var(--brand-soft)]/50"
        >
          <span className="text-sm font-medium text-[var(--muted-strong)]">
            Ngarko foto
          </span>
          <span className="text-xs text-[var(--muted)]">
            JPG, PNG ose WEBP · max 5 MB
          </span>
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

export { MAX_BYTES as IMAGE_MAX_BYTES };
