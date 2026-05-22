"use client";

import { motion } from "motion/react";
import type { MonthCell } from "@/lib/types";

interface Props {
  cells: MonthCell[];
}

const VB_W = 760;
const VB_H = 280;
const PAD_L = 24;
const PAD_R = 24;
const PAD_T = 28;
const PAD_B = 48;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;
const POINTS_PER_MONTH = 11;

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function seriesValues(key: string, baseline: number, amplitude: number): number[] {
  const seed = hashString(key);
  const values: number[] = [];
  for (let i = 0; i < POINTS_PER_MONTH; i++) {
    const t = (seed + i * 9301) % 233280;
    const noise = (t / 233280) * 2 - 1;
    const wave = Math.sin((i / POINTS_PER_MONTH) * Math.PI * 2 + (seed % 7)) * 0.5;
    values.push(baseline + (wave * 0.7 + noise * 0.5) * amplitude);
  }
  return values;
}

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cx = (p0.x + p1.x) / 2;
    d += ` Q ${cx.toFixed(2)},${p0.y.toFixed(2)} ${cx.toFixed(2)},${((p0.y + p1.y) / 2).toFixed(2)}`;
    d += ` Q ${cx.toFixed(2)},${p1.y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
  }
  return d;
}

export function CoverageChart({ cells }: Props) {
  const monthWidth = PLOT_W / cells.length;
  const covered = cells.filter((c) => c.status === "covered").length;

  const monthBounds = cells.map((cell, i) => ({
    cell,
    xStart: PAD_L + i * monthWidth,
    xEnd: PAD_L + (i + 1) * monthWidth,
    xCenter: PAD_L + (i + 0.5) * monthWidth,
  }));

  type SeriesConfig = { baseline: number; amplitude: number; color: string; width: number; opacity: number };
  const series: SeriesConfig[] = [
    { baseline: 0.42, amplitude: 0.22, color: "var(--color-accent)", width: 2, opacity: 1 },
    { baseline: 0.62, amplitude: 0.18, color: "#9DB4FF", width: 2, opacity: 0.9 },
  ];

  const seriesRuns = series.map((s) => {
    const runs: Array<Array<{ x: number; y: number }>> = [];
    let current: Array<{ x: number; y: number }> = [];
    monthBounds.forEach((mb) => {
      if (mb.cell.status === "covered") {
        const vals = seriesValues(`${mb.cell.key}:${s.baseline}`, s.baseline, s.amplitude);
        for (let i = 0; i < POINTS_PER_MONTH; i++) {
          const t = i / (POINTS_PER_MONTH - 1);
          const x = mb.xStart + t * monthWidth;
          const y = PAD_T + (1 - Math.max(0.08, Math.min(0.92, vals[i]))) * PLOT_H;
          current.push({ x, y });
        }
      } else {
        if (current.length > 0) {
          runs.push(current);
          current = [];
        }
      }
    });
    if (current.length > 0) runs.push(current);
    return { config: s, runs };
  });

  return (
    <div className="relative w-full">
      <div className="relative rounded-2xl border border-ink-200 bg-card overflow-hidden">
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 text-caption text-ink-900 bg-card border border-ink-200 px-2.5 py-1 rounded-full tabular-nums">
          <span className="text-accent font-medium">{covered}</span>
          <span className="text-ink-400">of {cells.length} months covered</span>
        </div>
        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 text-micro uppercase tracking-[0.12em] text-ink-500 bg-ink-100 px-2 py-1 rounded-full">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink-400 shimmer" />
          Sample preview
        </span>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto block" preserveAspectRatio="none">
          <defs>
            <linearGradient id="fadeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
            <pattern id="mockStripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="var(--color-ink-200)" strokeWidth="1" opacity="0.5" />
            </pattern>
          </defs>
          <rect
            x={PAD_L}
            y={PAD_T}
            width={VB_W - PAD_L - PAD_R}
            height={PLOT_H}
            fill="url(#mockStripes)"
            opacity="0.55"
          />


          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={PAD_L}
              x2={VB_W - PAD_R}
              y1={PAD_T + t * PLOT_H}
              y2={PAD_T + t * PLOT_H}
              stroke="var(--color-ink-100)"
              strokeWidth={1}
            />
          ))}
          <line
            x1={PAD_L}
            x2={VB_W - PAD_R}
            y1={PAD_T + PLOT_H}
            y2={PAD_T + PLOT_H}
            stroke="var(--color-ink-300)"
            strokeWidth={1}
          />

          {monthBounds.map((mb) => {
            if (mb.cell.status !== "missing" && mb.cell.status !== "parsing") return null;
            return (
              <motion.g
                key={`gap-${mb.cell.key}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <rect
                  x={mb.xStart + 8}
                  y={PAD_T + 6}
                  width={monthWidth - 16}
                  height={PLOT_H - 12}
                  fill="var(--color-gap-soft)"
                  rx={6}
                />
                <rect
                  x={mb.xStart + 8}
                  y={PAD_T + 6}
                  width={monthWidth - 16}
                  height={PLOT_H - 12}
                  fill="none"
                  stroke="var(--color-gap)"
                  strokeWidth={1.5}
                  strokeDasharray="6 5"
                  rx={6}
                  className="dash-march"
                />
              </motion.g>
            );
          })}


          {monthBounds.map((mb) => {
            if (mb.cell.status !== "failed") return null;
            const cx = mb.xCenter;
            const cy = PAD_T + PLOT_H / 2;
            return (
              <motion.g
                key={`failed-${mb.cell.key}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <rect
                  x={mb.xStart + 8}
                  y={PAD_T + 6}
                  width={monthWidth - 16}
                  height={PLOT_H - 12}
                  fill="var(--color-gap-soft)"
                  rx={6}
                />
                <rect
                  x={mb.xStart + 8}
                  y={PAD_T + 6}
                  width={monthWidth - 16}
                  height={PLOT_H - 12}
                  fill="none"
                  stroke="var(--color-gap)"
                  strokeWidth={1.5}
                  rx={6}
                />
                <circle cx={cx} cy={cy} r={11} fill="var(--color-gap)" />
                <path
                  d={`M ${cx} ${cy - 5} L ${cx} ${cy + 1} M ${cx} ${cy + 4} L ${cx} ${cy + 5}`}
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </motion.g>
            );
          })}

          {seriesRuns.map((sr, sIdx) =>
            sr.runs.map((run, rIdx) => {
              const d = smoothPath(run);
              const lastX = run[run.length - 1].x;
              const firstX = run[0].x;
              const fillD = `${d} L ${lastX},${PAD_T + PLOT_H} L ${firstX},${PAD_T + PLOT_H} Z`;
              return (
                <g key={`s${sIdx}-r${rIdx}`} className="shimmer">
                  {sIdx === 0 && <path d={fillD} fill="url(#fadeFill)" />}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: sr.config.opacity }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    d={d}
                    fill="none"
                    stroke={sr.config.color}
                    strokeWidth={sr.config.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="0.1 5"
                  />
                </g>
              );
            })
          )}

          {monthBounds.map((mb) => (
            <g key={`label-${mb.cell.key}`}>
              <text
                x={mb.xCenter}
                y={PAD_T + PLOT_H + 22}
                textAnchor="middle"
                fill={
                  mb.cell.status === "covered"
                    ? "var(--color-ink-900)"
                    : mb.cell.status === "failed"
                    ? "var(--color-gap)"
                    : "var(--color-ink-500)"
                }
                fontSize={12}
                fontFamily="var(--font-sans)"
                fontWeight={mb.cell.status === "covered" || mb.cell.status === "failed" ? 600 : 500}
                letterSpacing="0.02em"
              >
                {mb.cell.label}
              </text>
              <text
                x={mb.xCenter}
                y={PAD_T + PLOT_H + 36}
                textAnchor="middle"
                fill="var(--color-ink-300)"
                fontSize={9.5}
                fontFamily="var(--font-sans)"
                letterSpacing="0.06em"
              >
                {mb.cell.year}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-ink-500">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-[2px] bg-accent rounded-full" />
          <span>Covered (mock)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded border border-dashed border-[var(--color-gap)] bg-[var(--color-gap-soft)]" />
          <span>Missing</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded border bg-[var(--color-gap-soft)]" style={{ borderColor: "var(--color-gap)" }}>
            <span className="block w-1 h-1 rounded-full bg-[var(--color-gap)] mx-auto mt-[3px]" />
          </span>
          <span>Failed parse</span>
        </div>
      </div>
    </div>
  );
}
