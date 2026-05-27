import type { BankFixture, ExtractedData, MonthCell } from "./types";
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

export const BANK_FIXTURES: BankFixture[] = [
  { id: "beacon", name: "Beacon Bank", initials: "BB", color: "#1e3a8a" },
  { id: "sterling", name: "Sterling & Co", initials: "S", color: "#0f766e" },
  { id: "northwind", name: "Northwind Trust", initials: "NW", color: "#b45309" },
  { id: "atlas", name: "Atlas Financial", initials: "AF", color: "#6d28d9" },
  { id: "harbor", name: "Harbor Credit Union", initials: "HC", color: "#0369a1" },
];

const CONNECT_FAILURES = [
  "Bank declined the authentication request.",
  "Multi-factor challenge timed out.",
  "Account access could not be granted.",
  "Bank is temporarily unavailable. Try again in a few minutes.",
];

export function pickConnectFailure(seed: number): string {
  return CONNECT_FAILURES[seed % CONNECT_FAILURES.length];
}

let bankCursor = 0;
export function nextBank(): BankFixture {
  const b = BANK_FIXTURES[bankCursor % BANK_FIXTURES.length];
  bankCursor++;
  return b;
}

export function resetBankCursor() {
  bankCursor = 0;
}

export function connectionExtractedFor(monthsCovered: MonthCell[]): {
  transactions: number;
  periodLabel: string;
  account: { name: string; type: string; tail: string };
} {
  const account = nextAccount();
  let h = 0;
  for (const m of monthsCovered) {
    for (const ch of m.key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  }
  const transactions = monthsCovered.length * (140 + (h % 90));
  return {
    transactions,
    periodLabel: multiMonthPeriodLabel(monthsCovered),
    account,
  };
}
