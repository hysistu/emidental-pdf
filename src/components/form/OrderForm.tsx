"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToothChart } from "./ToothChart";
import { ImageUploadField, IMAGE_MAX_BYTES } from "./ImageUploadField";
import { StlUploadField, STL_MAX_BYTES } from "./StlUploadField";
import { EMPTY_ORDER, type MaterialKey, type OrderFormData } from "@/lib/types";
import { MATERIAL_OPTIONS, SHADE_PRESETS, exclusiveKeysForSet } from "@/lib/constants";
import { orderSchema } from "@/lib/schema";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Section({
  step,
  title,
  hint,
  children,
  delay = 0,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      <div className="flex items-start gap-3 rounded-xl bg-[var(--section)] px-4 py-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">
          {step}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-[var(--ink)]">{title}</h3>
          {hint ? (
            <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p>
          ) : null}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function FieldLabel({
  children,
  required,
  optional,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--muted-strong)]">
      <span>{children}</span>
      {required ? (
        <span className="text-[11px] font-normal text-red-500">
          e detyrueshme
        </span>
      ) : null}
      {optional ? (
        <span className="text-[11px] font-normal text-[var(--muted)]">
          opsionale
        </span>
      ) : null}
    </label>
  );
}

function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    error?: string;
    inputRef?: React.Ref<HTMLInputElement>;
  },
) {
  const { error, className, inputRef, ...rest } = props;
  return (
    <div>
      <input
        {...rest}
        ref={inputRef}
        className={[
          "w-full rounded-xl border bg-white/80 px-4 py-3 text-base text-[var(--ink)] outline-none transition",
          "placeholder:text-[var(--muted)]/70 focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/15",
          error ? "border-red-400" : "border-[var(--line)]",
          className ?? "",
        ].join(" ")}
      />
      {error ? <p className="mt-1.5 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

export function OrderForm() {
  const [data, setData] = useState<OrderFormData>(() => ({
    ...EMPTY_ORDER,
    acceptanceDate: todayISO(),
  }));
  const [retractedImage, setRetractedImage] = useState<File | null>(null);
  const [smileImage, setSmileImage] = useState<File | null>(null);
  const [upperJawScan, setUpperJawScan] = useState<File | null>(null);
  const [lowerJawScan, setLowerJawScan] = useState<File | null>(null);
  const [biteScan, setBiteScan] = useState<File | null>(null);
  const [biteScan2, setBiteScan2] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const firstErrorRef = useRef<HTMLInputElement>(null);

  const materialSet = useMemo(() => new Set(data.materials), [data.materials]);

  const update = <K extends keyof OrderFormData>(
    key: K,
    value: OrderFormData[K],
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
    }
  };

  const selectMaterialInGroup = (
    exclusiveSet: "material" | "restaurim",
    key: MaterialKey,
  ) => {
    const next = new Set(materialSet);
    // Clear both sides of this exclusive pair (e.g. Zirkon + Metal)
    for (const k of exclusiveKeysForSet(exclusiveSet)) next.delete(k);
    // Clicking the active option again clears it (optional)
    if (!materialSet.has(key)) next.add(key);
    update("materials", [...next] as MaterialKey[]);
  };

  const scrollToError = () => {
    requestAnimationFrame(() => {
      const el =
        formRef.current?.querySelector<HTMLElement>("[data-error='true']") ||
        firstErrorRef.current;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const imageErrors: Record<string, string> = {};
    if (retractedImage && retractedImage.size > IMAGE_MAX_BYTES) {
      imageErrors.retractedImage = "Fotoja e tërhequr duhet ≤ 5 MB";
    }
    if (smileImage && smileImage.size > IMAGE_MAX_BYTES) {
      imageErrors.smileImage = "Fotoja e buzëqeshjes duhet ≤ 5 MB";
    }
    if (upperJawScan && upperJawScan.size > STL_MAX_BYTES) {
      imageErrors.upperJawScan = "Upper jaw scan duhet ≤ 50 MB";
    }
    if (lowerJawScan && lowerJawScan.size > STL_MAX_BYTES) {
      imageErrors.lowerJawScan = "Lower jaw scan duhet ≤ 50 MB";
    }
    if (biteScan && biteScan.size > STL_MAX_BYTES) {
      imageErrors.biteScan = "Bite scan duhet ≤ 50 MB";
    }
    if (biteScan2 && biteScan2.size > STL_MAX_BYTES) {
      imageErrors.biteScan2 = "Bite scan 2 duhet ≤ 50 MB";
    }

    const payload: OrderFormData = {
      ...data,
      hasRetractedImage: Boolean(retractedImage),
      hasSmileImage: Boolean(smileImage),
      hasUpperJawScan: Boolean(upperJawScan),
      hasLowerJawScan: Boolean(lowerJawScan),
      hasBiteScan: Boolean(biteScan),
      hasBiteScan2: Boolean(biteScan2),
    };

    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success || Object.keys(imageErrors).length) {
      const fieldErrors: Record<string, string> = { ...imageErrors };
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const path = String(issue.path[0] ?? "form");
          if (!fieldErrors[path]) fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setStatus("error");
      setMessage(
        "Kontrolloni fushat e shënuara — vetëm pak gjëra janë të detyrueshme.",
      );
      scrollToError();
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("order", JSON.stringify(parsed.data));
        if (retractedImage) formData.append("retractedImage", retractedImage);
        if (smileImage) formData.append("smileImage", smileImage);
        if (upperJawScan) formData.append("upperJawScan", upperJawScan);
        if (lowerJawScan) formData.append("lowerJawScan", lowerJawScan);
        if (biteScan) formData.append("biteScan", biteScan);
        if (biteScan2) formData.append("biteScan2", biteScan2);

        const res = await fetch("/api/send-order", {
          method: "POST",
          body: formData,
        });
        const json = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !json.ok) {
          throw new Error(json.error || "Dërgimi dështoi");
        }
        setStatus("success");
        setMessage(
          "Porosia u dërgua me sukses. Do të kontaktoheni së shpejti.",
        );
        setData({ ...EMPTY_ORDER, acceptanceDate: todayISO() });
        setRetractedImage(null);
        setSmileImage(null);
        setUpperJawScan(null);
        setLowerJawScan(null);
        setBiteScan(null);
        setBiteScan2(null);
        setErrors({});
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Diçka shkoi keq");
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-10" noValidate>
      <div className="rounded-2xl border border-[var(--brand)]/15 bg-[var(--brand-soft)]/70 px-4 py-3 text-sm text-[var(--brand-dark)]">
        Plotësoni vetëm fushat e shënuara si{" "}
        <span className="font-semibold">të detyrueshme</span>. Të tjerat mund
        t’i lini bosh.
      </div>

      <Section
        step={1}
        title="Kush jeni ju dhe pacienti?"
        hint="Emri i doktorit dhe i pacientit mjafton për të filluar"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={errors.doctorName ? "true" : undefined}>
            <FieldLabel required>Emri i doktorit</FieldLabel>
            <TextInput
              value={data.doctorName}
              onChange={(e) => update("doctorName", e.target.value)}
              placeholder="p.sh. Dr. Enver Maloku"
              error={errors.doctorName}
              inputRef={errors.doctorName ? firstErrorRef : undefined}
              autoComplete="name"
            />
          </div>
          <div data-error={errors.patientName ? "true" : undefined}>
            <FieldLabel required>Emri i pacientit</FieldLabel>
            <TextInput
              value={data.patientName}
              onChange={(e) => update("patientName", e.target.value)}
              placeholder="Emri i plotë i pacientit"
              error={errors.patientName}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <FieldLabel optional>Nr. kartela</FieldLabel>
            <TextInput
              value={data.patientCardNo}
              onChange={(e) => update("patientCardNo", e.target.value)}
              placeholder="Nëse e posedoni"
              inputMode="numeric"
            />
          </div>
          <div>
            <FieldLabel optional>Gjinia</FieldLabel>
            <div className="flex gap-2">
              {(
                [
                  { value: "M", label: "Mashkull" },
                  { value: "F", label: "Femër" },
                ] as const
              ).map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() =>
                    update("gender", data.gender === g.value ? "" : g.value)
                  }
                  className={[
                    "flex-1 rounded-xl border py-3 text-sm font-semibold transition",
                    data.gender === g.value
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                      : "border-[var(--line)] bg-white/70 text-[var(--muted-strong)] hover:border-[var(--brand)]/40",
                  ].join(" ")}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel optional>Mosha</FieldLabel>
            <TextInput
              type="number"
              min={1}
              max={120}
              value={data.age}
              onChange={(e) => update("age", e.target.value)}
              placeholder="Vite"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={errors.acceptanceDate ? "true" : undefined}>
            <FieldLabel required>Data e pranimit</FieldLabel>
            <TextInput
              type="date"
              value={data.acceptanceDate}
              onChange={(e) => update("acceptanceDate", e.target.value)}
              error={errors.acceptanceDate}
            />
          </div>
          <div>
            <FieldLabel optional>Data e dorëzimit</FieldLabel>
            <TextInput
              type="date"
              value={data.deliveryDate}
              onChange={(e) => update("deliveryDate", e.target.value)}
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Nëse e lini bosh, puna bëhet brenda 5 ditëve standarde
            </p>
          </div>
        </div>
      </Section>

      <Section
        step={2}
        title="Cilët dhëmbë?"
        hint="Prekni dhëmbët, pastaj «Lidh urë» për 2+ dhëmbë"
        delay={0.04}
      >
        <div data-error={errors.selectedTeeth ? "true" : undefined}>
          <ToothChart
            selected={data.selectedTeeth}
            bridges={data.bridges}
            onChange={(teeth, bridges) => {
              setData((prev) => ({ ...prev, selectedTeeth: teeth, bridges }));
            }}
          />
          {errors.selectedTeeth ? (
            <p className="mt-2 text-sm text-red-500">{errors.selectedTeeth}</p>
          ) : null}
        </div>
      </Section>

      <Section
        step={3}
        title="Materiali dhe ngjyra"
        hint="Mund t’i lini bosh — do të përdoret dizajni standard"
        delay={0.06}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {MATERIAL_OPTIONS.map((group) => (
              <div
                key={group.group}
                className="space-y-2.5"
                role="radiogroup"
                aria-label={group.group}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {group.group}
                  <span className="ml-2 font-normal normal-case tracking-normal">
                    (një zgjedhje)
                  </span>
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const active = materialSet.has(item.key);
                    return (
                      <label
                        key={item.key}
                        className={[
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition",
                          active
                            ? "border-[var(--brand)]/40 bg-[var(--brand-soft)]"
                            : "border-[var(--line)] bg-white/60 hover:border-[var(--brand)]/25",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name={`material-set-${group.exclusiveSet}`}
                          checked={active}
                          onChange={() =>
                            selectMaterialInGroup(group.exclusiveSet, item.key)
                          }
                          onClick={() => {
                            if (active)
                              selectMaterialInGroup(group.exclusiveSet, item.key);
                          }}
                          className="mt-1 size-4 accent-[var(--brand)]"
                        />
                        <span>
                          <span className="block text-sm font-medium text-[var(--ink)]">
                            {item.label}
                          </span>
                          {item.hint ? (
                            <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                              {item.hint}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        <div>
          <FieldLabel optional>Ngjyra e dhëmbit</FieldLabel>
          <div className="mb-3 flex flex-wrap gap-2">
            {SHADE_PRESETS.map((shade) => {
              const active = data.toothColor === shade;
              return (
                <button
                  key={shade}
                  type="button"
                  onClick={() => update("toothColor", active ? "" : shade)}
                  className={[
                    "min-w-12 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                      : "border-[var(--line)] bg-white/80 text-[var(--muted-strong)] hover:border-[var(--brand)]/40",
                  ].join(" ")}
                >
                  {shade}
                </button>
              );
            })}
          </div>
          <TextInput
            value={data.toothColor}
            onChange={(e) => update("toothColor", e.target.value)}
            placeholder="Ose shkruani ngjyrën (p.sh. A2)"
          />
        </div>

        <div>
          <FieldLabel optional>Ngjyra e kultit punues</FieldLabel>
          <TextInput
            value={data.stumpShade}
            onChange={(e) => update("stumpShade", e.target.value)}
            placeholder="Vetëm për E.MAX & ZR.ML"
          />
        </div>
      </Section>

      <Section
        step={4}
        title="Shënime dhe kontakt"
        hint="Opsionale — por na ndihmon të ju kontaktojmë më shpejt"
        delay={0.08}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField
            label="Foto e tërhequr (retracted)"
            hint="Dhëmbët të tërhequr me retractor"
            file={retractedImage}
            onChange={(file) => {
              setRetractedImage(file);
              setErrors((prev) => {
                if (!prev.retractedImage) return prev;
                const next = { ...prev };
                delete next.retractedImage;
                return next;
              });
            }}
            error={errors.retractedImage}
          />
          <ImageUploadField
            label="Foto e buzëqeshjes (smile)"
            hint="Buzëqeshje natyrale e pacientit"
            file={smileImage}
            onChange={(file) => {
              setSmileImage(file);
              setErrors((prev) => {
                if (!prev.smileImage) return prev;
                const next = { ...prev };
                delete next.smileImage;
                return next;
              });
            }}
            error={errors.smileImage}
          />
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Skanime STL / PLY
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <StlUploadField
              label="Upper jaw scan"
              hint="Skandimi i nofullës së sipërme"
              file={upperJawScan}
              onChange={(file) => {
                setUpperJawScan(file);
                setErrors((prev) => {
                  if (!prev.upperJawScan) return prev;
                  const next = { ...prev };
                  delete next.upperJawScan;
                  return next;
                });
              }}
              error={errors.upperJawScan}
            />
            <StlUploadField
              label="Lower jaw scan"
              hint="Skandimi i nofullës së poshtme"
              file={lowerJawScan}
              onChange={(file) => {
                setLowerJawScan(file);
                setErrors((prev) => {
                  if (!prev.lowerJawScan) return prev;
                  const next = { ...prev };
                  delete next.lowerJawScan;
                  return next;
                });
              }}
              error={errors.lowerJawScan}
            />
            <StlUploadField
              label="Bite scan"
              hint="Skandimi i kafshimit"
              file={biteScan}
              onChange={(file) => {
                setBiteScan(file);
                setErrors((prev) => {
                  if (!prev.biteScan) return prev;
                  const next = { ...prev };
                  delete next.biteScan;
                  return next;
                });
              }}
              error={errors.biteScan}
            />
            <StlUploadField
              label="Bite scan 2"
              hint="Skandimi i dytë i kafshimit (opsional)"
              file={biteScan2}
              onChange={(file) => {
                setBiteScan2(file);
                setErrors((prev) => {
                  if (!prev.biteScan2) return prev;
                  const next = { ...prev };
                  delete next.biteScan2;
                  return next;
                });
              }}
              error={errors.biteScan2}
            />
          </div>
        </div>

        <div>
          <FieldLabel optional>Shënime / karakterizime</FieldLabel>
          <textarea
            value={data.characterizations}
            onChange={(e) => update("characterizations", e.target.value)}
            rows={3}
            placeholder="Çdo gjë që duam të dimë për rastin..."
            className="w-full rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/15"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={errors.contactEmail ? "true" : undefined}>
            <FieldLabel optional>Email për kopje</FieldLabel>
            <TextInput
              type="email"
              value={data.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="opsionale@email.com"
              error={errors.contactEmail}
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div>
            <FieldLabel optional>Telefoni</FieldLabel>
            <TextInput
              type="tel"
              value={data.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              placeholder="+383 ..."
              autoComplete="tel"
              inputMode="tel"
            />
          </div>
        </div>
      </Section>

      <div className="flex flex-col gap-4 border-t border-[var(--line)]/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <AnimatePresence mode="wait">
          {message ? (
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={
                status === "success"
                  ? "text-sm font-medium text-emerald-700"
                  : "text-sm font-medium text-red-600"
              }
            >
              {message}
            </motion.p>
          ) : (
            <span className="text-sm text-[var(--muted)]">
              PDF dërgohet automatikisht te laboratori.
            </span>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_16px_40px_-18px_rgba(27,111,181,0.95)] transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Duke dërguar…
            </>
          ) : (
            "Dërgo porosinë"
          )}
        </button>
      </div>
    </form>
  );
}
