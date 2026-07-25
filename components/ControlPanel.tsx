"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, LayoutGrid, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ControlPanel({
  confThreshold,
  iouThreshold,
  onConfChange,
  onIouChange,
  onLoadDemo,
  onExportCsv,
  exportDisabled,
}: {
  confThreshold: number;
  iouThreshold: number;
  onConfChange: (v: number) => void;
  onIouChange: (v: number) => void;
  onLoadDemo: () => void;
  onExportCsv: () => void;
  exportDisabled: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-1 gap-3 rounded-lg border border-line bg-panel p-4 lg:grid-cols-[1fr_auto]"
    >
      <div>
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-scan" />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            AI tuning
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SliderField
            label="Detection certainty"
            subtitle="How certain must the AI be to flag surface damage?"
            symbol="conf"
            value={confThreshold}
            min={0.1}
            max={0.9}
            step={0.05}
            onChange={onConfChange}
          />
          <SliderField
            label="Duplicate filter (IoU)"
            subtitle="How strictly should the AI merge overlapping detection boxes?"
            symbol="iou"
            value={iouThreshold}
            min={0.1}
            max={0.9}
            step={0.05}
            onChange={onIouChange}
          />
        </div>
      </div>

      <div className="flex flex-col justify-end gap-2 lg:w-52">
        <button
          type="button"
          onClick={onLoadDemo}
          className="flex items-center justify-center gap-2 rounded-md border border-line-bright bg-panel-raised px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-primary transition-colors hover:border-scan/50 hover:text-scan"
        >
          <LayoutGrid size={13} />
          Load demo batch
        </button>
        <button
          type="button"
          onClick={onExportCsv}
          disabled={exportDisabled}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors",
            exportDisabled
              ? "cursor-not-allowed border-line text-faint"
              : "border-scan/40 bg-scan/[0.08] text-scan hover:bg-scan/[0.14]"
          )}
        >
          <Download size={13} />
          Export report (CSV)
        </button>
      </div>
    </motion.div>
  );
}

function SliderField({
  label,
  subtitle,
  symbol,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  subtitle: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const fillPct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2">
        <div className="flex items-baseline justify-between gap-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {label}
          </label>
          <span className="shrink-0 font-mono text-xs font-semibold text-scan text-numeric">
            {symbol}={value.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-snug text-faint">{subtitle}</p>
      </div>
      <input
        type="range"
        className="slider-neon"
        style={{ ["--slider-fill" as string]: `${fillPct}%` }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] text-faint">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}
