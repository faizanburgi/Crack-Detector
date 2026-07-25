import type { DetectionSeverity } from "@/lib/types";
import { severityStyles, cn } from "@/lib/utils";

export default function StatusBadge({
  severity,
}: {
  severity: DetectionSeverity;
}) {
  const s = severityStyles[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-panel-raised px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em]",
        s.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
