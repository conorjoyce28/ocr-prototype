"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { BankConnection, BankFixture, ConnectOptions, MonthCell } from "@/lib/types";
import { BANK_FIXTURES } from "@/lib/fixtures";
import { BankConnectScan } from "./BankConnectScan";
import { ConnectAnimation } from "./ConnectAnimation";

interface Props {
  connections: BankConnection[];
  cells: MonthCell[];
  onConnect: (bank: BankFixture, options?: ConnectOptions) => void;
  onConnectComplete: (connectionId: string) => void;
  onRemove: (connectionId: string) => void;
}

export function InlineConnector({
  connections,
  cells,
  onConnect,
  onConnectComplete,
  onRemove,
}: Props) {
  const [escapeOpen, setEscapeOpen] = useState(false);
  const [escapeText, setEscapeText] = useState("");
  const [escapeSent, setEscapeSent] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const connecting = connections.filter((c) => c.state === "connecting");
  const settled = connections.filter((c) => c.state !== "connecting");
  const allCovered = cells.every((c) => c.status === "covered");
  const showIdle = connecting.length === 0;

  const connectedBankIds = new Set(
    connections.filter((c) => c.state === "connected").map((c) => c.bank.id)
  );

  function submitEscape() {
    if (!escapeText.trim()) return;
    setEscapeSent(true);
    setEscapeOpen(false);
  }

  function handlePick(bank: BankFixture) {
    setPickerOpen(false);
    onConnect(bank);
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
          showIdle
            ? "border-ink-300 bg-card hover:border-ink-500"
            : "border-accent/40 bg-card"
        } ${allCovered && showIdle ? "opacity-60 pointer-events-none" : ""}`}
      >
        <AnimatePresence mode="wait">
          {showIdle ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 py-7"
            >
              {pickerOpen ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-body-sm text-ink-900 font-medium">Select your bank</div>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(false)}
                      className="text-body-xs text-ink-500 hover:text-ink-900"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BANK_FIXTURES.map((bank) => {
                      const already = connectedBankIds.has(bank.id);
                      return (
                        <button
                          key={bank.id}
                          type="button"
                          disabled={already}
                          onClick={() => handlePick(bank)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                            already
                              ? "border-ink-200 bg-ink-50 cursor-not-allowed opacity-60"
                              : "border-ink-200 bg-card hover:border-ink-500 hover:bg-ink-50"
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-md flex items-center justify-center text-white font-semibold shrink-0"
                            style={{ background: bank.color, fontSize: 10 }}
                          >
                            {bank.initials}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-body-xs text-ink-900 font-medium truncate">
                              {bank.name}
                            </span>
                            {already && (
                              <span className="block text-micro text-ink-500">Connected</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  disabled={allCovered}
                  className="w-full flex flex-col items-center text-center disabled:cursor-not-allowed"
                >
                  <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center mb-3">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M3 8 10 4l7 4M4 9v6m4-6v6m4-6v6m4-6v6M2 17h16"
                        stroke="var(--color-ink-700)"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-body-sm text-ink-900 font-medium">
                    {allCovered ? (
                      "Coverage complete"
                    ) : settled.length > 0 ? (
                      <>
                        Connect <span className="text-accent">another bank</span>
                      </>
                    ) : (
                      <>
                        Search for your bank, or <span className="text-accent">browse</span>
                      </>
                    )}
                  </div>
                  <div className="text-body-xs text-ink-500 mt-1">
                    {allCovered
                      ? "All six months covered."
                      : "Encrypted handoff to your bank via Plaid."}
                  </div>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 py-5 space-y-4"
            >
              {connecting.map((c, idx) => (
                <div
                  key={c.id}
                  className={idx > 0 ? "pt-4 border-t border-ink-200" : ""}
                >
                  <div className="flex items-start gap-4">
                    <BankConnectScan connection={c} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="text-body-sm text-ink-900 font-medium truncate">
                            {c.bank.name}
                          </div>
                          <div className="text-caption text-ink-500 mt-0.5">
                            Encrypted handoff via Plaid
                          </div>
                        </div>
                        <span className="text-caption uppercase tracking-[0.1em] text-accent font-medium shrink-0">
                          Connecting
                        </span>
                      </div>
                      <ConnectAnimation
                        connection={c}
                        onComplete={() => onConnectComplete(c.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {settled.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <h4 className="text-body-sm font-medium text-ink-900">Connected accounts</h4>
            <span className="text-caption text-ink-500 tabular-nums">
              {settled.length} {settled.length === 1 ? "account" : "accounts"}
            </span>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {settled
                .slice()
                .reverse()
                .map((c) => (
                  <ConnectionRow key={c.id} connection={c} onRemove={onRemove} />
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
                <path
                  d="M2 5.2 4 7l4-4.5"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="text-body-sm text-ink-900 font-medium">Thanks, we have your note</div>
              <div className="text-body-xs text-ink-500 mt-0.5 leading-snug">
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
            <div className="text-body-sm text-ink-900 font-medium">
              Tell us why so we can help
            </div>
            <textarea
              autoFocus
              value={escapeText}
              onChange={(e) => setEscapeText(e.target.value)}
              placeholder="For example: my bank isn't supported, I only have a non-business account, I prefer to upload statements instead..."
              rows={3}
              maxLength={500}
              className="w-full text-body-sm text-ink-900 placeholder:text-ink-400 border border-ink-300 rounded-md px-2.5 py-2 leading-snug focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-caption text-ink-400 tabular-nums">
                {escapeText.length}/500
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEscapeOpen(false);
                    setEscapeText("");
                  }}
                  className="text-body-xs text-ink-500 hover:text-ink-900 px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitEscape}
                  disabled={!escapeText.trim()}
                  className="text-body-xs font-medium px-3.5 py-1.5 rounded-full bg-ink-900 text-white hover:bg-accent disabled:bg-ink-200 disabled:text-ink-400 disabled:cursor-not-allowed transition-colors"
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
            className="flex items-center justify-end text-body-xs"
          >
            <button
              type="button"
              onClick={() => setEscapeOpen(true)}
              className="text-ink-500 hover:text-ink-900 transition-colors underline decoration-dotted underline-offset-4"
            >
              I cannot connect my bank →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConnectionRow({
  connection,
  onRemove,
}: {
  connection: BankConnection;
  onRemove: (id: string) => void;
}) {
  const failed = connection.state === "failed";
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
        className="w-8 h-8 rounded-md flex items-center justify-center text-white font-semibold shrink-0"
        style={{ background: connection.bank.color, fontSize: 11 }}
      >
        {connection.bank.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <div className="text-body-sm text-ink-900 font-medium truncate">
            {connection.bank.name}
          </div>
          {!failed && (
            <span
              className="text-micro uppercase tracking-[0.1em] font-medium px-1.5 py-0.5 rounded-full shrink-0"
              style={{
                background: "var(--color-positive-soft)",
                color: "var(--color-positive)",
              }}
            >
              Live
            </span>
          )}
        </div>
        {!failed && (
          <div className="mt-0.5 text-body-xs text-ink-500 leading-snug">
            <span className="text-ink-700">{connection.accountName}</span>{" "}
            <span className="text-ink-400">·</span> {connection.accountType}{" "}
            <span className="text-ink-400">·</span> ••{connection.accountTail}
            {connection.transactions && (
              <>
                <br />
                {connection.periodLabel}{" "}
                <span className="text-ink-400">·</span>{" "}
                <span className="tabular-nums">{connection.transactions} transactions</span>{" "}
                <span className="text-ink-400">·</span>{" "}
                <span className="text-accent">
                  {connection.spanMonths} month{connection.spanMonths > 1 ? "s" : ""} covered
                </span>
              </>
            )}
          </div>
        )}
        {failed && (
          <div className="mt-0.5 text-body-xs text-[var(--color-gap)] leading-snug">
            {connection.failureReason ?? "Couldn't connect this bank."}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(connection.id)}
        aria-label="Disconnect bank"
        className="text-ink-400 hover:text-ink-900 transition-colors shrink-0 p-1"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2 2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}
