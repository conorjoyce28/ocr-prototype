"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { MonthCell, UploadedFile } from "@/lib/types";
import { ParseAnimation } from "./ParseAnimation";

interface Props {
  files: UploadedFile[];
  onUpload: (fileName: string, sizeKb: number) => void;
  onParseComplete: (fileId: string) => void;
  cells: MonthCell[];
}

export function UploadPanel({ files, onUpload, onParseComplete, cells }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const missing = cells.filter((c) => c.status === "missing").length;
  const parsing = cells.filter((c) => c.status === "parsing").length;
  const allCovered = missing === 0 && parsing === 0;

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => {
      onUpload(f.name, Math.round(f.size / 102.4) / 10);
    });
  }

  function handleDemoDrop() {
    const stamp = new Date().toISOString().slice(0, 10);
    onUpload(`statement-${stamp}.pdf`, 138.4 + Math.random() * 40);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[14px] font-medium text-ink-900">
          {allCovered ? "Coverage complete" : "Upload"}
        </h3>
        {!allCovered && (
          <span className="text-[12px] text-ink-500">
            {missing > 0
              ? `${missing} month${missing > 1 ? "s" : ""} missing`
              : "Reading the latest file"}
          </span>
        )}
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative block rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
          dragOver
            ? "border-accent bg-accent-soft"
            : "border-ink-300 bg-card hover:border-ink-500 hover:bg-ink-100"
        } ${allCovered ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="px-5 py-7 flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4m0 0-4 4m4-4 4 4M5 20h14" stroke="var(--color-ink-700)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-[14px] text-ink-900 font-medium">
            Drag statements here, or <span className="text-accent">browse</span>
          </div>
          <div className="text-[12px] text-ink-500 mt-1">PDF or image. One file per month works best.</div>
        </div>
      </label>

      <div className="flex items-center justify-between text-[12px]">
        <button
          type="button"
          onClick={handleDemoDrop}
          disabled={allCovered}
          className="text-ink-500 hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed underline decoration-dotted underline-offset-4"
        >
          Drop demo statement
        </button>
        <span className="text-ink-300">·</span>
        <a className="text-ink-500 hover:text-ink-900 transition-colors" href="#" onClick={(e) => e.preventDefault()}>
          I cannot provide this
        </a>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {files
            .slice()
            .reverse()
            .map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-ink-200 bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-ink-100 flex items-center justify-center shrink-0">
                      <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                        <path d="M2 1h6l4 4v9.5A1.5 1.5 0 0 1 10.5 16h-8.5A1.5 1.5 0 0 1 .5 14.5v-12A1.5 1.5 0 0 1 2 1Z" stroke="var(--color-ink-500)" strokeWidth="1" />
                        <path d="M8 1v4h4" stroke="var(--color-ink-500)" strokeWidth="1" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] text-ink-900 font-medium truncate">{file.fileName}</div>
                      <div className="text-[11.5px] text-ink-500 mt-0.5 tabular-nums">
                        {file.sizeKb.toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  {file.state === "complete" ? (
                    <span className="text-[11px] uppercase tracking-[0.1em] text-positive font-medium" style={{ color: "var(--color-positive)" }}>
                      Accepted
                    </span>
                  ) : (
                    <span className="text-[11px] uppercase tracking-[0.1em] text-accent font-medium">
                      Reading
                    </span>
                  )}
                </div>
                <ParseAnimation file={file} onComplete={() => onParseComplete(file.id)} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
