"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CoverageChart } from "./CoverageChart";
import { WeekHeatmap } from "./WeekHeatmap";
import { InlineUploader } from "./InlineUploader";
import type { MonthCell, UploadedFile, UploadOptions } from "@/lib/types";

export type DrawerVisualization = "line" | "calendar";

interface Props {
  open: boolean;
  visualization: DrawerVisualization;
  onClose: () => void;
  cells: MonthCell[];
  files: UploadedFile[];
  onUpload: (fileName: string, sizeKb: number, options?: UploadOptions) => void;
  onParseComplete: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
  onReset: () => void;
}

export function UploadDrawer({
  open,
  visualization,
  onClose,
  cells,
  files,
  onUpload,
  onParseComplete,
  onRemoveFile,
  onReset,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const covered = cells.filter((c) => c.status === "covered").length;
  const total = cells.length;
  const allCovered = covered === total;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{ background: "rgba(0, 0, 0, 0.08)" }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute top-0 right-0 h-full w-full max-w-[580px] bg-card flex flex-col"
            style={{ boxShadow: "var(--shadow-overlay-panel), var(--shadow-overlay-modal)" }}
          >
            <header className="flex items-center gap-4 px-6 h-[64px] border-b border-ink-200 shrink-0">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full border border-ink-300 hover:bg-ink-100 flex items-center justify-center text-ink-900 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="min-w-0">
                <h2 className="text-[20px] leading-tight font-medium text-ink-900 tracking-tight">
                  Upload bank statements
                </h2>
                <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 mt-0.5">
                  {visualization === "calendar" ? "Calendar view" : "Line diagram"}
                </div>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="ml-auto text-[12px] text-ink-500 hover:text-ink-900 transition-colors underline decoration-dotted underline-offset-4"
                title="Reset demo state"
              >
                Reset
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <p className="text-[16px] leading-[1.4] text-ink-900 font-medium">
                Six months of continuous data, one transaction every 14 days, across all bank
                accounts.
              </p>

              {visualization === "calendar" ? (
                <WeekHeatmap cells={cells} />
              ) : (
                <CoverageChart cells={cells} />
              )}

              <InlineUploader
                files={files}
                cells={cells}
                onUpload={onUpload}
                onParseComplete={onParseComplete}
                onRemoveFile={onRemoveFile}
              />
            </div>

            <footer className="border-t border-ink-200 px-6 h-[80px] flex items-center justify-between bg-card shrink-0">
              <div className="text-[12.5px] text-ink-500 tabular-nums">
                <span className="text-ink-900 font-medium">{covered}</span>
                <span> of {total} months covered</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={!allCovered}
                className="px-5 h-10 rounded-full text-[13.5px] font-medium transition-colors disabled:bg-ink-100 disabled:text-ink-300 disabled:cursor-not-allowed bg-accent text-white hover:opacity-90"
              >
                Submit statements
              </button>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

