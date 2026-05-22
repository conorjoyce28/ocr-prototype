"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { MonthCell, UploadedFile, UploadOptions } from "@/lib/types";
import { ParseAnimation } from "./ParseAnimation";
import { DocumentScan } from "./DocumentScan";

interface Props {
  files: UploadedFile[];
  cells: MonthCell[];
  demoSpan: number;
  onUpload: (fileName: string, sizeKb: number, options?: UploadOptions) => void;
  onParseComplete: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
}

export function InlineUploader({
  files,
  cells,
  demoSpan,
  onUpload,
  onParseComplete,
  onRemoveFile,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [escapeOpen, setEscapeOpen] = useState(false);
  const [escapeText, setEscapeText] = useState("");
  const [escapeSent, setEscapeSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function submitEscape() {
    if (!escapeText.trim()) return;
    setEscapeSent(true);
    setEscapeOpen(false);
  }

  const parsingFiles = files.filter((f) => f.state === "parsing");
  const settledFiles = files.filter((f) => f.state !== "parsing");
  const allCovered = cells.every((c) => c.status === "covered");
  const showIdle = parsingFiles.length === 0;

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => {
      onUpload(f.name, Math.round(f.size / 102.4) / 10, { span: demoSpan });
    });
  }

  return (
    <div className="space-y-4">
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
        className={`relative block rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
          showIdle && !allCovered ? "cursor-pointer" : ""
        } ${
          dragOver
            ? "border-accent bg-accent-soft"
            : showIdle
            ? "border-ink-300 bg-card hover:border-ink-500 hover:bg-ink-100"
            : "border-accent/40 bg-card"
        } ${allCovered && showIdle ? "opacity-60 pointer-events-none" : ""}`}
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

        <AnimatePresence mode="wait">
          {showIdle ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 py-7 flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 16V4m0 0-4 4m4-4 4 4M5 20h14"
                    stroke="var(--color-ink-700)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-[14px] text-ink-900 font-medium">
                {allCovered ? (
                  "Coverage complete"
                ) : (
                  <>
                    Drag and drop here, or <span className="text-accent">browse</span>
                  </>
                )}
              </div>
              <div className="text-[12px] text-ink-500 mt-1">
                {allCovered ? "All six months covered." : "PDF, PNG, TIFF or JPG"}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="parsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 py-5 space-y-4"
            >
              {parsingFiles.map((file, idx) => (
                <div
                  key={file.id}
                  className={idx > 0 ? "pt-4 border-t border-ink-200" : ""}
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-start gap-4">
                    <DocumentScan file={file} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="text-[13px] text-ink-900 font-medium truncate">
                            {file.fileName}
                          </div>
                          <div className="text-[11.5px] text-ink-500 mt-0.5 tabular-nums">
                            {file.sizeKb.toFixed(1)} KB · {file.spanMonths} month
                            {file.spanMonths > 1 ? "s" : ""}
                          </div>
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.1em] text-accent font-medium shrink-0">
                          Reading
                        </span>
                      </div>
                      <ParseAnimation file={file} onComplete={() => onParseComplete(file.id)} />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </label>

      {settledFiles.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <h4 className="text-[13px] font-medium text-ink-900">
              Uploaded statements
            </h4>
            <span className="text-[11.5px] text-ink-500 tabular-nums">
              {settledFiles.length} file{settledFiles.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {settledFiles
                .slice()
                .reverse()
                .map((file) => (
                  <FileRow key={file.id} file={file} onRemove={onRemoveFile} />
                ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {escapeSent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg border border-ink-200 bg-card px-3.5 py-3 flex items-start gap-3"
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--color-positive)" }}
            >
              <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
                <path d="M2 5.2 4 7l4-4.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="text-[13px] text-ink-900 font-medium">Thanks, we have your note</div>
              <div className="text-[12px] text-ink-500 mt-0.5 leading-snug">
                A team member will reach out within 24 hours to help you complete this step.
              </div>
            </div>
          </motion.div>
        ) : escapeOpen ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-ink-200 bg-card p-3.5 space-y-2.5"
          >
            <div className="text-[13px] text-ink-900 font-medium">
              Tell us why so we can help
            </div>
            <textarea
              autoFocus
              value={escapeText}
              onChange={(e) => setEscapeText(e.target.value)}
              placeholder="For example: my business is only three months old, my bank only releases statements quarterly, I recently switched banks..."
              rows={3}
              maxLength={500}
              className="w-full text-[13px] text-ink-900 placeholder:text-ink-400 border border-ink-300 rounded-md px-2.5 py-2 leading-snug focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-ink-400 tabular-nums">
                {escapeText.length}/500
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEscapeOpen(false);
                    setEscapeText("");
                  }}
                  className="text-[12.5px] text-ink-500 hover:text-ink-900 px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitEscape}
                  disabled={!escapeText.trim()}
                  className="text-[12.5px] font-medium px-3.5 py-1.5 rounded-full bg-ink-900 text-white hover:bg-accent disabled:bg-ink-200 disabled:text-ink-400 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-end text-[12px]"
          >
            <button
              type="button"
              onClick={() => setEscapeOpen(true)}
              className="text-ink-500 hover:text-ink-900 transition-colors underline decoration-dotted underline-offset-4"
            >
              I cannot provide six months of statements →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FileRow({ file, onRemove }: { file: UploadedFile; onRemove: (id: string) => void }) {
  const failed = file.state === "failed";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className={`rounded-lg border bg-card px-3 py-2.5 flex items-start gap-3 ${
        failed ? "border-[var(--color-gap)]/30" : "border-ink-200"
      }`}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
        style={{ background: failed ? "var(--color-gap-soft)" : "var(--color-positive-soft)" }}
      >
        {failed ? (
          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
            <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="var(--color-gap)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
            <path d="M3 6.2 5 8l4-5" stroke="var(--color-positive)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <div className="text-[13px] text-ink-900 font-medium truncate">{file.fileName}</div>
          <div className="text-[11px] text-ink-500 tabular-nums shrink-0">
            {file.sizeKb.toFixed(1)} KB
          </div>
        </div>
        {file.extracted && !failed && (
          <div className="mt-0.5 text-[12px] text-ink-500 leading-snug">
            <span className="text-ink-700">{file.extracted.accountName}</span>{" "}
            <span className="text-ink-400">·</span>{" "}
            {file.extracted.accountType}{" "}
            <span className="text-ink-400">·</span> ••{file.extracted.accountTail}
            <br />
            {file.extracted.periodLabel}{" "}
            <span className="text-ink-400">·</span>{" "}
            <span className="tabular-nums">{file.extracted.transactions} transactions</span>
            {file.spanMonths > 1 && (
              <>
                {" "}
                <span className="text-ink-400">·</span>{" "}
                <span className="text-accent">{file.spanMonths} months covered</span>
              </>
            )}
          </div>
        )}
        {failed && (
          <div className="mt-0.5 text-[12px] text-[var(--color-gap)] leading-snug">
            {file.failureReason ?? "Couldn't accept this statement."}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        aria-label="Remove file"
        className="text-ink-400 hover:text-ink-900 transition-colors shrink-0 p-1"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2 2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}

function FileGlyph() {
  return (
    <div className="w-8 h-8 rounded-md bg-ink-100 flex items-center justify-center shrink-0">
      <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
        <path
          d="M2 1h6l4 4v9.5A1.5 1.5 0 0 1 10.5 16h-8.5A1.5 1.5 0 0 1 .5 14.5v-12A1.5 1.5 0 0 1 2 1Z"
          stroke="var(--color-ink-500)"
          strokeWidth="1"
        />
        <path d="M8 1v4h4" stroke="var(--color-ink-500)" strokeWidth="1" />
      </svg>
    </div>
  );
}
