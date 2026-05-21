import type { MonthCell } from "./types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function buildGoalWindow(endYear: number, endMonthIndex: number, count = 6): MonthCell[] {
  const cells: MonthCell[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(endYear, endMonthIndex - i, 1);
    cells.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: MONTH_LABELS[d.getMonth()],
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      status: "missing",
    });
  }
  return cells;
}

export function monthPeriodLabel(cell: MonthCell): string {
  const start = new Date(cell.year, cell.monthIndex, 1);
  const end = new Date(cell.year, cell.monthIndex + 1, 0);
  return `${MONTH_LABELS[start.getMonth()]} ${start.getDate()} – ${MONTH_LABELS[end.getMonth()]} ${end.getDate()}, ${cell.year}`;
}

export function multiMonthPeriodLabel(cells: MonthCell[]): string {
  if (cells.length === 0) return "";
  if (cells.length === 1) return monthPeriodLabel(cells[0]);
  const first = cells[0];
  const last = cells[cells.length - 1];
  const start = new Date(first.year, first.monthIndex, 1);
  const end = new Date(last.year, last.monthIndex + 1, 0);
  const startStr = `${MONTH_LABELS[start.getMonth()]} ${start.getDate()}`;
  const endStr = `${MONTH_LABELS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  return start.getFullYear() === end.getFullYear()
    ? `${startStr} – ${endStr}`
    : `${startStr}, ${start.getFullYear()} – ${endStr}`;
}

export function findConsecutiveMissingRun(
  cells: MonthCell[],
  startIndex: number,
  maxLength: number
): MonthCell[] {
  const run: MonthCell[] = [];
  for (let i = startIndex; i < cells.length && run.length < maxLength; i++) {
    if (cells[i].status === "missing" || cells[i].status === "failed") {
      run.push(cells[i]);
    } else {
      break;
    }
  }
  return run;
}

export function findFirstUploadableRun(cells: MonthCell[], desiredLength: number): MonthCell[] {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].status === "missing" || cells[i].status === "failed") {
      const run = findConsecutiveMissingRun(cells, i, desiredLength);
      if (run.length > 0) return run;
    }
  }
  return [];
}
