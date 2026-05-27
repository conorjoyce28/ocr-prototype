"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { BankConnection } from "@/lib/types";

interface Props {
  connection: BankConnection;
  onComplete: () => void;
}

const STEPS = [
  { label: "Locating your bank", durationMs: 900 },
  { label: "Authenticating securely", durationMs: 1300 },
  { label: "Granting account access", durationMs: 1200 },
  { label: "Syncing six months of transactions", durationMs: 1400 },
];

const TOTAL_MS = STEPS.reduce((a, s) => a + s.durationMs, 0);
const FAIL_AT_INDEX = 1;
const FAIL_MS = STEPS.slice(0, FAIL_AT_INDEX + 1).reduce((a, s) => a + s.durationMs, 0);

export function ConnectAnimation({ connection, onComplete }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [done, setDone] = useState(false);
  const willFail = !!connection.willFail;

  useEffect(() => {
    if (connection.state === "connected" || connection.state === "failed") {
      setActiveIdx(willFail ? FAIL_AT_INDEX : STEPS.length);
      setDone(true);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const cap = willFail ? FAIL_AT_INDEX : STEPS.length - 1;
    let acc = 0;
    STEPS.forEach((s, i) => {
      if (i > cap) return;
      acc += s.durationMs;
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          if (i < cap) setActiveIdx(i + 1);
        }, acc - s.durationMs + 80)
      );
    });
    const finishAt = willFail ? FAIL_MS : TOTAL_MS;
    const completeTimer = setTimeout(() => {
      if (cancelled) return;
      setActiveIdx(willFail ? FAIL_AT_INDEX : STEPS.length);
      setDone(true);
      onComplete();
    }, finishAt);
    timers.push(completeTimer);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [connection.id, connection.state, willFail, onComplete]);

  const failedReason = connection.failureReason ?? "Bank declined the request.";

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {STEPS.map((step, i) => {
          let state: "done" | "active" | "pending" | "failed";
          if (willFail && done && i === FAIL_AT_INDEX) state = "failed";
          else if (done || i < activeIdx) state = "done";
          else if (i === activeIdx) state = "active";
          else state = "pending";
          if (willFail && i > FAIL_AT_INDEX) state = "pending";
          return (
            <div key={step.label} className="flex items-center gap-2.5 text-body-sm">
              <StepDot state={state} />
              <span
                className={
                  state === "active"
                    ? "text-accent font-medium"
                    : state === "failed"
                    ? "text-[var(--color-gap)] font-medium"
                    : state === "done"
                    ? "text-ink-300"
                    : "text-ink-300"
                }
                style={
                  state === "active"
                    ? { animation: "shimmer-line 1.4s ease-in-out infinite" }
                    : undefined
                }
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {done && !willFail && connection.transactions && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="pt-3 mt-3 border-t border-ink-200 space-y-2"
          >
            <Confirm
              delay={0.05}
              label="Account"
              value={`${connection.accountType} ••${connection.accountTail}`}
            />
            <Confirm delay={0.18} label="Period synced" value={connection.periodLabel ?? ""} />
            <Confirm
              delay={0.31}
              label="Transactions"
              value={`${connection.transactions}`}
            />
            <Confirm
              delay={0.44}
              label="Months covered"
              value={`${connection.spanMonths}`}
            />
          </motion.div>
        )}
        {done && willFail && (
          <motion.div
            key="failure"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="pt-3 mt-3 border-t border-ink-200"
          >
            <div className="flex items-start gap-2.5 text-body-sm">
              <span
                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full mt-0.5"
                style={{ background: "var(--color-gap-soft)" }}
              >
                <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
                  <path
                    d="M3 3l4 4M7 3l-4 4"
                    stroke="var(--color-gap)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div className="min-w-0">
                <div className="text-[var(--color-gap)] font-medium">Couldn't connect</div>
                <div className="text-ink-500 mt-0.5 leading-snug">{failedReason}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepDot({ state }: { state: "done" | "active" | "pending" | "failed" }) {
  if (state === "done") {
    return (
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-ink-100">
        <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
          <path
            d="M2 5.2 4 7l4-4.5"
            stroke="var(--color-ink-300)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "failed") {
    return (
      <span
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full"
        style={{ background: "var(--color-gap-soft)" }}
      >
        <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
          <path d="M3 3l4 4M7 3l-4 4" stroke="var(--color-gap)" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="relative inline-flex w-3.5 h-3.5">
        <span className="absolute inset-0 rounded-full border-[1.5px] border-ink-200" />
        <span className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-accent border-r-accent animate-spin" />
      </span>
    );
  }
  return <span className="inline-block w-3.5 h-3.5 rounded-full border-[1.5px] border-ink-200" />;
}

function Confirm({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-between gap-3 text-body-sm"
    >
      <div className="flex items-center gap-2.5 text-ink-700">
        <span
          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full"
          style={{ background: "var(--color-positive-soft)" }}
        >
          <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
            <path
              d="M2 5.2 4 7l4-4.5"
              stroke="var(--color-positive)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>{label}</span>
      </div>
      <span className="text-ink-900 font-medium tabular-nums text-right">{value}</span>
    </motion.div>
  );
}
