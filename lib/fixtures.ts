import type { ExtractedData, MonthCell } from "./types";
import { multiMonthPeriodLabel } from "./months";

const ACCOUNT_FIXTURES: Array<{ name: string; type: string; tail: string }> = [
  { name: "Wild Deodorant Ltd", type: "Business checking", tail: "4521" },
  { name: "Wild Deodorant Ltd", type: "Business savings", tail: "8807" },
  { name: "Wild Deodorant Ltd", type: "Business reserve", tail: "1147" },
  { name: "Lucia Marin", type: "Personal checking", tail: "6634" },
];

const FAILURE_REASONS = [
  "Couldn't read transaction dates on page 2.",
  "Statement period falls outside the six month goal window.",
  "Account number does not match a known business account.",
  "Document is password protected.",
];

let accountCursor = 0;

export function nextAccount(): { name: string; type: string; tail: string } {
  const a = ACCOUNT_FIXTURES[accountCursor % ACCOUNT_FIXTURES.length];
  accountCursor++;
  return a;
}

export function resetAccountCursor() {
  accountCursor = 0;
}

export function extractedFor(monthsCovered: MonthCell[]): ExtractedData {
  const account = nextAccount();
  let h = 0;
  for (const m of monthsCovered) {
    for (const ch of m.key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  }
  const transactions = monthsCovered.length * (110 + (h % 80));
  return {
    periodLabel: multiMonthPeriodLabel(monthsCovered),
    transactions,
    accountName: account.name,
    accountType: account.type,
    accountTail: account.tail,
  };
}

export function pickFailureReason(seed: number): string {
  return FAILURE_REASONS[seed % FAILURE_REASONS.length];
}
