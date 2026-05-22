"use client";

import { motion } from "motion/react";
import type { UploadedFile } from "@/lib/types";

interface Props {
  file: UploadedFile;
}

export function DocumentScan({ file }: Props) {
  const failed = file.state === "failed";
  const done = file.state === "complete";
  const parsing = file.state === "parsing";

  const accent =
    failed ? "var(--color-gap)" : done ? "var(--color-positive)" : "var(--color-accent)";

  const account = file.extracted;

  return (
    <div className="shrink-0 w-[128px]">
      <div
        className="relative rounded-md border bg-ink-50 overflow-hidden"
        style={{
          borderColor: parsing ? "var(--color-ink-200)" : accent,
          boxShadow: parsing ? "none" : `0 0 0 3px ${accent}14`,
          aspectRatio: "5 / 7",
        }}
      >
        <div className="absolute inset-1.5 bg-card rounded-sm overflow-hidden">
          <div className="px-2 pt-2 pb-1.5 border-b border-ink-100">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-sm bg-ink-300" />
              <div className="h-1.5 w-10 rounded-sm bg-ink-200" />
            </div>
            <div className="h-1 w-14 rounded-sm bg-ink-200 mt-1" />
          </div>

          <div className="px-2 py-1.5 space-y-1 border-b border-ink-100">
            <Field label="ACC" value={account?.accountTail ? `••${account.accountTail}` : "••••"} />
            <Field label="PER" value={file.spanMonths === 1 ? "1 mo" : `${file.spanMonths} mo`} />
          </div>

          <div className="px-2 py-1.5 space-y-[5px]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-1">
                <div className="h-1 rounded-sm bg-ink-200" style={{ width: `${28 + (i * 9) % 30}px` }} />
                <div
                  className="h-1 rounded-sm tabular-nums"
                  style={{
                    width: `${14 + (i * 7) % 14}px`,
                    background: i === 3 && failed ? "var(--color-gap-soft)" : "var(--color-ink-200)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {parsing && (
          <>
            <motion.div
              initial={{ top: "6px", opacity: 0 }}
              animate={{ top: ["6px", "94%", "6px"], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                opacity: { times: [0, 0.05, 0.95, 1], duration: 3, repeat: Infinity },
              }}
              className="absolute left-0 right-0 h-[2px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%)",
                boxShadow: "0 0 8px var(--color-accent), 0 0 16px var(--color-accent)",
              }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.18, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: "var(--color-accent-soft)" }}
            />
          </>
        )}

        {done && (
          <div
            className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-positive)" }}
          >
            <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
              <path
                d="M2 5.2 4 7l4-4.5"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {failed && (
          <div
            className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-gap)" }}
          >
            <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
              <path
                d="M3 3l4 4M7 3l-4 4"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-2 text-micro text-ink-500 leading-tight text-center truncate">
        {parsing ? "Scanning…" : done ? "Scanned" : failed ? "Couldn't read" : "Ready"}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-1 text-[8px] tracking-wider">
      <span className="text-ink-400 uppercase">{label}</span>
      <span className="text-ink-700 font-medium tabular-nums">{value}</span>
    </div>
  );
}
