"use client";

import { useCallback, useState } from "react";
import { UploadDrawer, type DrawerVisualization } from "@/components/UploadDrawer";
import { buildGoalWindow, findFirstUploadableRun } from "@/lib/months";
import { extractedFor, pickFailureReason, resetAccountCursor } from "@/lib/fixtures";
import type { MonthCell, UploadedFile, UploadOptions } from "@/lib/types";

const TODAY = new Date(2026, 4, 21);

export default function Page() {
  const [cells, setCells] = useState<MonthCell[]>(() =>
    buildGoalWindow(TODAY.getFullYear(), TODAY.getMonth(), 6)
  );
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visualization, setVisualization] = useState<DrawerVisualization>("line");

  const openDrawer = useCallback((viz: DrawerVisualization) => {
    setVisualization(viz);
    setDrawerOpen(true);
  }, []);

  const handleUpload = useCallback(
    (fileName: string, sizeKb: number, options: UploadOptions = {}) => {
      const desiredSpan = Math.max(1, Math.min(6, options.span ?? 1));
      setCells((prev) => {
        const run = findFirstUploadableRun(prev, desiredSpan);
        if (run.length === 0) return prev;

        const id = `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const assignedKeys = run.map((c) => c.key);

        const newFile: UploadedFile = {
          id,
          fileName,
          sizeKb,
          assignedMonthKeys: assignedKeys,
          spanMonths: run.length,
          startedAt: Date.now(),
          state: "parsing",
          willFail: options.fail === true,
          extracted: extractedFor(run),
        };
        setFiles((fprev) => [...fprev, newFile]);

        return prev.map((c) =>
          assignedKeys.includes(c.key) ? { ...c, status: "parsing" as const } : c
        );
      });
    },
    []
  );

  const handleParseComplete = useCallback((fileId: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === fileId);
      if (!f) return prev;

      const willFail = !!f.willFail;
      const reason = pickFailureReason(f.startedAt);

      setCells((cellsPrev) =>
        cellsPrev.map((c) =>
          f.assignedMonthKeys.includes(c.key)
            ? { ...c, status: willFail ? ("failed" as const) : ("covered" as const) }
            : c
        )
      );

      return prev.map((x) =>
        x.id === fileId
          ? {
              ...x,
              state: willFail ? ("failed" as const) : ("complete" as const),
              failureReason: willFail ? reason : undefined,
            }
          : x
      );
    });
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === fileId);
      if (!f) return prev;
      setCells((cellsPrev) =>
        cellsPrev.map((c) =>
          f.assignedMonthKeys.includes(c.key) ? { ...c, status: "missing" as const } : c
        )
      );
      return prev.filter((x) => x.id !== fileId);
    });
  }, []);

  const handleReset = useCallback(() => {
    setCells(buildGoalWindow(TODAY.getFullYear(), TODAY.getMonth(), 6));
    setFiles([]);
    resetAccountCursor();
  }, []);

  const covered = cells.filter((c) => c.status === "covered").length;

  return (
    <div className="min-h-screen flex bg-paper">
      <LeftRail />
      <main className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-1 px-10 lg:px-16 py-10 lg:py-12">
          <div className="max-w-[920px]">
            <h1 className="text-title-lg leading-[1.1] tracking-tight text-ink-900 font-medium">
              Connect all your bank accounts
            </h1>
            <p className="mt-2 text-body-sm text-ink-500">
              We use your banking data to assess your application and build your offer.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <OptionCard
                tag="Recommended"
                title="Connect your bank"
                subtitle="Instant verification, usually under an hour."
                cta="Manage accounts"
                onClick={() => {}}
                variant="primary"
              />
              <OptionCard
                tag="Line diagram"
                title="Upload statements"
                subtitle="See coverage as a transaction line across the six month window."
                cta="Open line view"
                onClick={() => openDrawer("line")}
                variant={covered > 0 && visualization === "line" ? "in-progress" : "secondary"}
                preview={<LinePreview />}
              />
              <OptionCard
                tag="Calendar view"
                title="Upload statements"
                subtitle="See coverage as weekly blocks. Two empty blocks in a row is a 14 day gap."
                cta="Open calendar view"
                onClick={() => openDrawer("calendar")}
                variant={covered > 0 && visualization === "calendar" ? "in-progress" : "secondary"}
                preview={<CalendarPreview />}
              />
            </div>

            <div className="mt-6 text-body-sm text-ink-700">
              <span className="font-medium">Need help connecting? </span>
              <a className="text-accent hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                Invite a team member
              </a>{" "}
              <span className="text-ink-500">to connect on your behalf, or </span>
              <a className="text-accent hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                talk to our team
              </a>
              <span className="text-ink-500"> for support.</span>
            </div>
          </div>
        </div>
        <BottomBar />
      </main>

      <UploadDrawer
        open={drawerOpen}
        visualization={visualization}
        onClose={() => setDrawerOpen(false)}
        cells={cells}
        files={files}
        onUpload={handleUpload}
        onParseComplete={handleParseComplete}
        onRemoveFile={handleRemoveFile}
        onReset={handleReset}
      />
    </div>
  );
}

function LeftRail() {
  return (
    <aside className="w-[320px] shrink-0 border-r border-ink-200 bg-card px-7 py-8 flex flex-col">
      <div className="flex items-center mb-9">
        <span className="text-title-sm tracking-tight font-semibold text-ink-900">Wayflyer</span>
      </div>

      <div className="mb-8 h-1 rounded-full bg-ink-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: "44%",
            background: "linear-gradient(90deg, #001eff 0%, #5b8cff 60%, #3dc8ff 100%)",
          }}
        />
      </div>

      <nav className="flex-1 space-y-5">
        <StepperItem state="done" label="Business country" />
        <StepperItem state="done" label="Monthly revenue" />
        <StepperItem state="done" label="Business details" />
        <StepperItem state="active" label="Connections and data" expanded>
          <p className="text-body-xs text-ink-500 leading-snug mt-2 mb-1">
            We use your data to understand your business&apos;s financial health.
          </p>
          <p className="text-body-xs text-ink-500 mb-3">Avg. 6 min.</p>
          <div className="ml-1 border-l border-ink-200 pl-4 space-y-3">
            <SubStep state="active" label="Bank accounts" />
            <SubStep state="idle" label="Platforms" />
          </div>
        </StepperItem>
      </nav>

      <div className="mt-8 pt-6 border-t border-ink-200 text-body-xs space-y-2">
        <div className="text-ink-500 font-medium">Having trouble?</div>
        <p className="text-ink-500 leading-snug">
          Learn more about why we need to{" "}
          <a className="text-ink-900 underline decoration-ink-300 hover:decoration-ink-900" href="#" onClick={(e) => e.preventDefault()}>
            connect to your bank accounts
          </a>
          .
        </p>
        <div className="pt-3 text-caption text-ink-500 flex items-center gap-2">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-ink-900">Terms of Business</a>
          <span className="text-ink-300">·</span>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-ink-900">Privacy Policy</a>
        </div>
      </div>
    </aside>
  );
}

function StepperItem({
  state,
  label,
  expanded,
  children,
}: {
  state: "done" | "active" | "idle";
  label: string;
  expanded?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <StepCircle state={state} />
        <span
          className={
            state === "active"
              ? "text-body-sm text-ink-900 font-medium"
              : state === "done"
              ? "text-body-sm text-ink-700"
              : "text-body-sm text-ink-500"
          }
        >
          {label}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" className={`ml-auto text-ink-300 ${expanded ? "rotate-180" : ""}`} fill="none">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {expanded && children && <div className="pl-8">{children}</div>}
    </div>
  );
}

function StepCircle({ state }: { state: "done" | "active" | "idle" }) {
  if (state === "done") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "var(--color-positive)" }}>
        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
          <path d="M2 5.2 4 7l4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
      </span>
    );
  }
  return <span className="inline-block w-5 h-5 rounded-full border-[1.5px] border-ink-300" />;
}

function SubStep({ state, label }: { state: "active" | "idle"; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {state === "active" ? (
        <span className="w-2.5 h-2.5 rounded-full bg-accent" />
      ) : (
        <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-ink-300" />
      )}
      <span className={state === "active" ? "text-body-sm text-ink-900 font-medium" : "text-body-sm text-ink-500"}>
        {label}
      </span>
    </div>
  );
}

function TopBar() {
  return (
    <div className="h-16 border-b border-ink-200 flex items-center justify-end px-10 lg:px-16 gap-4 bg-paper/80">
      <IconButton label="Rewards">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="6" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 10h16M10 6v12" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </IconButton>
      <IconButton label="Support">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M3 11a7 7 0 0 1 14 0v3a2 2 0 0 1-2 2h-1v-5h3M3 11v3a2 2 0 0 0 2 2h1v-5H3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </IconButton>
      <div className="ml-2 w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-caption font-medium text-ink-700 tracking-wide">
        WD
      </div>
    </div>
  );
}

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="w-9 h-9 rounded-full hover:bg-ink-100 text-ink-700 hover:text-ink-900 flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  );
}

function BottomBar() {
  return (
    <div className="border-t border-ink-200 px-10 lg:px-16 py-5 flex items-center justify-between bg-paper">
      <button className="px-4 py-2 rounded-full border border-ink-300 text-body-sm text-ink-900 hover:bg-ink-100 transition-colors">
        Business model
      </button>
      <button className="px-5 py-2.5 rounded-full bg-accent text-white text-body-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
        Platforms
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10m0 0-3.5-3.5M12 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function OptionCard({
  tag,
  title,
  subtitle,
  cta,
  onClick,
  variant,
  preview,
}: {
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  onClick: () => void;
  variant: "primary" | "secondary" | "in-progress";
  preview?: React.ReactNode;
}) {
  const border =
    variant === "primary"
      ? "border-accent"
      : variant === "in-progress"
      ? "border-accent/60"
      : "border-ink-300";
  return (
    <div className={`rounded-xl bg-card border ${border} px-5 pt-4 pb-5 flex flex-col`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-caption uppercase tracking-[0.14em] text-ink-500">{tag}</span>
        {variant === "in-progress" && (
          <span className="text-micro uppercase tracking-[0.12em] font-medium px-2 py-1 rounded-full bg-accent-soft text-accent">
            In progress
          </span>
        )}
      </div>
      <div className="text-title-xs tracking-tight text-ink-900 font-medium leading-tight">{title}</div>
      <div className="mt-1 text-body-xs text-ink-500 leading-snug">{subtitle}</div>
      {preview && <div className="mt-4">{preview}</div>}
      <button
        type="button"
        onClick={onClick}
        className={`mt-5 w-full py-2.5 rounded-full text-body-sm font-medium transition-colors ${
          variant === "primary"
            ? "border border-accent text-accent hover:bg-accent-soft"
            : "border border-ink-300 text-ink-900 hover:border-ink-900 hover:bg-ink-100"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

function LinePreview() {
  return (
    <div className="rounded-md bg-ink-50 border border-ink-200 p-2 h-[58px] overflow-hidden">
      <svg viewBox="0 0 120 36" className="w-full h-full">
        <defs>
          <linearGradient id="lp-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 24 Q 10 12 20 18 T 40 14 T 60 22 L 60 36 L 0 36 Z" fill="url(#lp-fade)" />
        <path d="M0 24 Q 10 12 20 18 T 40 14 T 60 22" stroke="var(--color-accent)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <rect x="64" y="6" width="14" height="24" fill="var(--color-gap-soft)" stroke="var(--color-gap)" strokeWidth="1" strokeDasharray="3 2" rx="2" />
        <rect x="80" y="6" width="14" height="24" fill="var(--color-gap-soft)" stroke="var(--color-gap)" strokeWidth="1" strokeDasharray="3 2" rx="2" />
        <path d="M96 22 Q 104 16 112 18 L 120 18" stroke="var(--color-accent)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function CalendarPreview() {
  const states: Array<"on" | "off" | "fail"> = ["on", "on", "off", "on", "off", "on"];
  return (
    <div className="rounded-md bg-ink-50 border border-ink-200 p-3 h-[58px] flex flex-col justify-center gap-2">
      <div className="relative h-1.5 rounded-full overflow-hidden bg-ink-200">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, #001eff 0%, #5b8cff 60%, #3dc8ff 100%)" }}
        />
        <div className="absolute inset-0 flex">
          {states.map((s, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                background:
                  s === "on" ? "transparent" : s === "fail" ? "var(--color-gap)" : "var(--color-ink-100)",
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-1">
        {states.map((s, i) => (
          <div
            key={i}
            className={`flex-1 text-[7px] uppercase tracking-[0.08em] text-center ${
              s === "on" ? "text-ink-500" : s === "fail" ? "text-[var(--color-gap)]" : "text-ink-400"
            }`}
          >
            {s === "off" ? "Gap" : s === "fail" ? "Fail" : ["D", "J", "F", "M", "A", "M"][i]}
          </div>
        ))}
      </div>
    </div>
  );
}
