"use client";

import { motion } from "framer-motion";
import { ScanLine, TriangleAlert, Gauge, Images } from "lucide-react";
import type { BatchMetrics } from "@/lib/types";
import { formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CRITICAL_RATIO_THRESHOLD = 30; // percent — flags the batch as high-severity

export default function MetricsHeader({ metrics }: { metrics: BatchMetrics }) {
  const isHighSeverity = metrics.damageRatio >= CRITICAL_RATIO_THRESHOLD;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricTile
        icon={<Images size={16} />}
        label="Images processed"
        value={metrics.totalProcessed.toString()}
        accent="scan"
      />
      <MetricTile
        icon={<ScanLine size={16} />}
        label="Cracked images"
        value={metrics.totalCracked.toString()}
        accent={metrics.totalCracked > 0 ? "amber" : "ok"}
      />
      <MetricTile
        icon={<Gauge size={16} />}
        label="Avg. confidence"
        value={metrics.totalCracked > 0 ? formatPercent(metrics.avgConfidence) : "—"}
        accent="scan"
      />
      <MetricTile
        icon={<TriangleAlert size={16} />}
        label="Batch damage ratio"
        value={formatPercent(metrics.damageRatio)}
        accent={isHighSeverity ? "alert" : "amber"}
        pulse={isHighSeverity}
      />
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  accent,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "scan" | "amber" | "alert" | "ok";
  pulse?: boolean;
}) {
  const accentText = {
    scan: "text-scan",
    amber: "text-amber",
    alert: "text-alert",
    ok: "text-ok",
  }[accent];

  const accentBorder = {
    scan: "border-scan/25",
    amber: "border-amber/25",
    alert: "border-alert/40",
    ok: "border-ok/25",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-panel px-4 py-3.5",
        accentBorder,
        pulse && "animate-pulse-ring"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {label}
        </span>
        <span className={accentText}>{icon}</span>
      </div>
      <div
        className={cn(
          "mt-1.5 font-display text-2xl font-semibold tracking-tight text-numeric",
          accentText,
          pulse && "animate-flicker"
        )}
      >
        {value}
      </div>
      {pulse && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-alert to-transparent" />
      )}
    </motion.div>
  );
}
