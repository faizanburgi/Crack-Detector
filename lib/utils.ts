import { clsx, type ClassValue } from "clsx";
import type { Detection, DetectionSeverity, InspectionImage } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Severity is derived from crack count and peak confidence for the image.
 * Tuned for structural-inspection triage, not a calibrated engineering standard —
 * adjust thresholds against your dataset before using this for real sign-off.
 */
export function classifySeverity(detections: Detection[]): DetectionSeverity {
  if (detections.length === 0) return "none";
  const peak = Math.max(...detections.map((d) => d.confidence));
  if (detections.length >= 4 || peak >= 0.75) return "critical";
  if (detections.length >= 2 || peak >= 0.5) return "moderate";
  return "low";
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatConfidence(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export const severityStyles: Record<
  DetectionSeverity,
  { label: string; text: string; ring: string; dot: string; glow: string }
> = {
  none: {
    label: "CLEAR",
    text: "text-ok",
    ring: "ring-ok/30",
    dot: "bg-ok",
    glow: "shadow-[0_0_12px_rgba(60,230,139,0.35)]",
  },
  low: {
    label: "LOW",
    text: "text-scan",
    ring: "ring-scan/30",
    dot: "bg-scan",
    glow: "shadow-[0_0_12px_rgba(76,243,255,0.35)]",
  },
  moderate: {
    label: "MODERATE",
    text: "text-amber",
    ring: "ring-amber/30",
    dot: "bg-amber",
    glow: "shadow-[0_0_12px_rgba(255,176,32,0.35)]",
  },
  critical: {
    label: "CRITICAL",
    text: "text-alert",
    ring: "ring-alert/40",
    dot: "bg-alert",
    glow: "shadow-[0_0_16px_rgba(255,59,92,0.5)]",
  },
};

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function csvCell(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/**
 * Builds a CSV report from the current batch and triggers a browser download.
 * Client-side only — call from an event handler, not during render.
 */
export function exportBatchCsv(images: InspectionImage[]) {
  const header = [
    "filename",
    "status",
    "severity",
    "crack_count",
    "avg_confidence_pct",
    "max_confidence_pct",
  ];

  const rows = images.map((img) => {
    const confidences = img.detections.map((d) => d.confidence * 100);
    const avg =
      confidences.length > 0
        ? (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(1)
        : "";
    const max = confidences.length > 0 ? Math.max(...confidences).toFixed(1) : "";

    return [
      img.file.name,
      img.status,
      img.severity,
      img.detections.length,
      avg,
      max,
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  link.href = url;
  link.download = `crackscan-report-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
