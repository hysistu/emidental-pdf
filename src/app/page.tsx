"use client";

import { motion } from "framer-motion";
import { LAB } from "@/lib/constants";
import { OrderForm } from "@/components/form/OrderForm";

function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white">
          EMI Dental
        </a>
        <a
          href="#porosia"
          className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
        >
          Plotëso porosinë
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] overflow-hidden text-white"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 18% 20%, rgba(120,190,235,0.35), transparent 55%), radial-gradient(900px 600px at 85% 15%, rgba(40,110,170,0.45), transparent 50%), linear-gradient(160deg, #0d3d66 0%, #1b6fb5 42%, #0f4f7c 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.35'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      {/* Atmospheric dental silhouette */}
      <div className="pointer-events-none absolute -right-16 bottom-[-8%] h-[70%] w-[70%] opacity-25 sm:right-[-4%] sm:opacity-35">
        <svg viewBox="0 0 420 480" className="h-full w-full animate-float-soft" fill="none">
          <path
            d="M210 40c-42 0-78 28-92 68-18 52-8 110 10 168 10 32 8 62-4 88-8 18-6 40 8 52 16 14 40 10 54-6 18-20 34-22 54-22s36 2 54 22c14 16 38 20 54 6 14-12 16-34 8-52-12-26-14-56-4-88 18-58 28-116 10-168-14-40-50-68-92-68Z"
            fill="white"
            fillOpacity="0.55"
          />
          <path
            d="M148 120c18-24 42-36 62-36s44 12 62 36"
            stroke="white"
            strokeOpacity="0.5"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-20 pt-28 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-sm font-medium tracking-[0.22em] text-white/70 uppercase"
        >
          {LAB.tagline}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl"
        >
          EMI DENTAL LAB.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="mt-6 max-w-xl text-lg text-white/80 sm:text-xl"
        >
          Plotësoni porosinë e laboratorit online — PDF gjenerohet dhe dërgohet automatikisht.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#porosia"
            className="relative inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--brand-dark)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] transition hover:bg-white/95"
          >
            <span className="absolute inset-0 rounded-full animate-pulse-ring bg-white/40" />
            <span className="relative">Filloni porosinë</span>
          </a>
          <a
            href={`tel:${LAB.phone.replace(/[^\d+]/g, "")}`}
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            {LAB.phone}
          </a>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg)] to-transparent" />
    </section>
  );
}

function FormSection() {
  return (
    <section id="porosia" className="relative z-10 -mt-8 pb-20 sm:-mt-12 sm:pb-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[28px] border border-white/60 bg-[var(--surface)] p-5 shadow-[0_30px_80px_-40px_rgba(21,64,110,0.55)] backdrop-blur-xl sm:p-8 md:p-10"
        >
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand)] uppercase">
                Formular digjital
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
                Porosia e laboratorit
              </h2>
            </div>
            <p className="max-w-xs text-sm text-[var(--muted)]">
              I njëjti formulari i EMI Dental — tani digjital, me PDF të gatshëm për dërgim.
            </p>
          </div>
          <OrderForm />
        </motion.div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)]/70 bg-white/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>{LAB.address}</p>
        <p>{LAB.phone}</p>
        <p>©{LAB.legal}</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <FormSection />
      <SiteFooter />
    </main>
  );
}
