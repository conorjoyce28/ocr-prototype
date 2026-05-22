"use client";

import type { MonthCell } from "@/lib/types";

interface Props {
  cells: MonthCell[];
}

const GRADIENT = "linear-gradient(90deg, #001eff 0%, #5b8cff 60%, #3dc8ff 100%)";

export function MonthProgressBar({ cells }: Props) {
  const covered = cells.filter((c) => c.status === "covered").length;

  return (
    <div className="relative w-full">
      <div className="relative rounded-2xl border border-ink-200 bg-card px-6 pt-12 pb-6">
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 text-caption text-ink-900 bg-card border border-ink-200 px-2.5 py-1 rounded-full tabular-nums">
          <span className="text-accent font-medium">{covered}</span>
          <span className="text-ink-400">of {cells.length} months covered</span>
        </div>

        <div className="relative h-2.5 rounded-full overflow-hidden bg-ink-100">
          <div className="absolute inset-0" style={{ background: GRADIENT }} />
          <div className="absolute inset-0 flex">
            {cells.map((cell) => (
              <div
                key={cell.key}
                className="flex-1"
                style={{
                  background:
                    cell.status === "covered"
                      ? "transparent"
                      : cell.status === "failed"
                      ? "var(--color-gap)"
                      : "var(--color-ink-100)",
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex pointer-events-none">
            {cells.slice(0, -1).map((cell, i) => (
              <div key={cell.key} className="flex-1 relative">
                <span
                  className="absolute top-0 bottom-0 right-0 w-px"
                  style={{
                    background:
                      cells[i + 1].status === "covered" && cell.status === "covered"
                        ? "rgba(255,255,255,0.35)"
                        : "transparent",
                  }}
                />
              </div>
            ))}
            <div className="flex-1" />
          </div>
        </div>

        <div className="flex mt-3">
          {cells.map((cell) => {
            const isCovered = cell.status === "covered";
            const isFailed = cell.status === "failed";
            return (
              <div key={cell.key} className="flex-1 text-center px-1">
                <div
                  className={`text-caption tabular-nums tracking-tight ${
                    isCovered
                      ? "text-ink-900 font-medium"
                      : isFailed
                      ? "text-[var(--color-gap)] font-medium"
                      : "text-ink-500"
                  }`}
                >
                  {cell.label}
                </div>
                <div className="text-micro text-ink-400 tracking-[0.04em]">{cell.year}</div>
                {!isCovered && (
                  <div
                    className={`mt-1 text-micro font-medium uppercase tracking-[0.08em] ${
                      isFailed ? "text-[var(--color-gap)]" : "text-ink-400"
                    }`}
                  >
                    {isFailed ? "Failed" : "Gap"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
