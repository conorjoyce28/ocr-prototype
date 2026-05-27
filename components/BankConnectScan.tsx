"use client";

import { motion } from "motion/react";
import type { BankConnection } from "@/lib/types";

interface Props {
  connection: BankConnection;
}

export function BankConnectScan({ connection }: Props) {
  const failed = connection.state === "failed";
  const done = connection.state === "connected";
  const connecting = connection.state === "connecting";

  const accent =
    failed ? "var(--color-gap)" : done ? "var(--color-positive)" : "var(--color-accent)";

  return (
    <div className="shrink-0 w-[128px]">
      <div
        className="relative rounded-md border bg-card overflow-hidden flex items-center justify-center"
        style={{
          borderColor: connecting ? "var(--color-ink-200)" : accent,
          boxShadow: connecting ? "none" : `0 0 0 3px ${accent}14`,
          aspectRatio: "5 / 7",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <BankMark
            initials={connection.bank.initials}
            color={connection.bank.color}
            pulsing={connecting}
          />
          <ConnectLine state={connection.state} />
          <WayMark active={done} failed={failed} pulsing={connecting} />
        </div>

        {connecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.12, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "var(--color-accent-soft)" }}
          />
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
              <path d="M3 3l4 4M7 3l-4 4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-2 text-micro text-ink-500 leading-tight text-center truncate">
        {connecting ? "Connecting…" : done ? "Connected" : failed ? "Declined" : "Ready"}
      </div>
    </div>
  );
}

function BankMark({
  initials,
  color,
  pulsing,
}: {
  initials: string;
  color: string;
  pulsing: boolean;
}) {
  return (
    <div className="relative w-9 h-9 shrink-0">
      {pulsing && (
        <>
          <motion.span
            className="absolute inset-0 rounded-md"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            style={{ background: color, opacity: 0.18 }}
          />
          <motion.span
            className="absolute inset-0 rounded-md"
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
            style={{ background: color, opacity: 0.18 }}
          />
        </>
      )}
      <div
        className="relative w-full h-full rounded-md flex items-center justify-center text-white font-semibold"
        style={{ background: color, fontSize: 11 }}
      >
        {initials}
      </div>
    </div>
  );
}

function ConnectLine({ state }: { state: BankConnection["state"] }) {
  const connecting = state === "connecting";
  const done = state === "connected";
  const failed = state === "failed";

  if (failed) {
    return (
      <div className="flex-1 mx-2 h-px relative">
        <div className="absolute inset-0" style={{ background: "var(--color-gap)", opacity: 0.4 }} />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex-1 mx-2 h-px relative">
        <div
          className="absolute inset-0"
          style={{ background: "var(--color-positive)", opacity: 0.55 }}
        />
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="flex-1 mx-2 h-[2px] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "var(--color-ink-200)", opacity: 0.8 }}
        />
        <motion.div
          className="absolute top-0 bottom-0 w-1/2"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%)",
          }}
        />
      </div>
    );
  }

  return <div className="flex-1 mx-2 h-px bg-ink-200" />;
}

function WayMark({
  active,
  failed,
  pulsing,
}: {
  active: boolean;
  failed: boolean;
  pulsing: boolean;
}) {
  const color = failed
    ? "var(--color-gap)"
    : active
    ? "var(--color-positive)"
    : "var(--color-accent)";
  return (
    <div className="relative w-9 h-9 shrink-0">
      {pulsing && (
        <motion.span
          className="absolute inset-0 rounded-md"
          initial={{ scale: 1, opacity: 0.45 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
          style={{ background: color, opacity: 0.16 }}
        />
      )}
      <div
        className="relative w-full h-full rounded-md flex items-center justify-center text-white font-semibold"
        style={{ background: color, fontSize: 13 }}
      >
        W
      </div>
    </div>
  );
}
