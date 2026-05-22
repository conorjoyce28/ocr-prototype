"use client";

import { motion } from "motion/react";
import type { MonthCell, MonthStatus } from "@/lib/types";

interface Props {
  cells: MonthCell[];
}

const WEEKS_PER_MONTH = 4;

function statusClass(status: MonthStatus): string {
  switch (status) {
    case "covered":
      return "bg-accent border-accent";
    case "failed":
      return "border-[var(--color-gap)]";
    default:
      return "bg-card border-[var(--color-gap)] border-dashed";
  }
}

export function WeekHeatmap({ cells }: Props) {
  const covered = cells.filter((c) => c.status === "covered").length;
  const weeksTotal = cells.length * WEEKS_PER_MONTH;
  const weeksCovered = covered * WEEKS_PER_MONTH;

  return (
    <div className="relative w-full">
      <div className="relative rounded-2xl border border-ink-200 bg-card overflow-hidden px-5 pt-12 pb-5">
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 text-[11px] text-ink-900 bg-card border border-ink-200 px-2.5 py-1 rounded-full tabular-nums">
          <span className="text-accent font-medium">{covered}</span>
          <span className="text-ink-400">of {cells.length} months covered</span>
        </div>
        <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-ink-500 bg-ink-100 px-2 py-1 rounded-full tabular-nums">
          {weeksCovered}/{weeksTotal} weeks
        </div>

        <div className="flex items-end gap-3 w-full">
          {cells.map((cell) => (
            <MonthGroup key={cell.key} cell={cell} />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-500">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1" />
            <path d="M5.5 3.2v3M5.5 7.4v.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>Each block is one week. Two empty blocks in a row is a 14 day gap.</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-ink-500">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-accent" />
          <span>Covered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm border border-dashed border-[var(--color-gap)] bg-card" />
          <span>Missing</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-3 h-3 rounded-sm"
            style={{ background: "var(--color-gap)" }}
          >
            <svg viewBox="0 0 6 6" className="w-1.5 h-1.5" fill="none">
              <path d="M1.5 1.5l3 3M4.5 1.5l-3 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
          <span>Failed parse</span>
        </div>
      </div>
    </div>
  );
}

function MonthGroup({ cell }: { cell: MonthCell }) {
  return (
    <div className="flex flex-col items-stretch gap-2 flex-1 min-w-0">
      <div className="flex gap-[3px]">
        {Array.from({ length: WEEKS_PER_MONTH }).map((_, i) => (
          <WeekBlock key={i} status={cell.status} delay={i * 0.05} index={i} />
        ))}
      </div>
      <div className="flex flex-col items-center">
        <span
          className={`text-[11.5px] tabular-nums tracking-tight ${
            cell.status === "covered"
              ? "text-ink-900 font-medium"
              : cell.status === "failed"
              ? "text-[var(--color-gap)] font-medium"
              : "text-ink-500"
          }`}
        >
          {cell.label}
        </span>
        <span className="text-[9.5px] text-ink-400 tracking-[0.04em]">{cell.year}</span>
      </div>
    </div>
  );
}

function WeekBlock({ status, delay, index }: { status: MonthStatus; delay: number; index: number }) {
  const failed = status === "failed";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay }}
      className={`relative flex-1 h-9 rounded-[3px] border ${statusClass(status)}`}
      style={{
        background: failed ? "var(--color-gap)" : undefined,
      }}
    >
      {failed && index === 1 && (
        <svg viewBox="0 0 8 8" className="absolute inset-0 m-auto w-2 h-2" fill="none">
          <path d="M2 2l4 4M6 2 2 6" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </motion.div>
  );
}
