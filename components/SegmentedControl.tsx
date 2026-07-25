"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SegmentedControl<T extends string>({
  layoutId,
  options,
  value,
  onChange,
  size = "md",
}: {
  layoutId: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-line bg-panel p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded font-mono uppercase tracking-[0.08em] transition-colors",
              size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3.5 py-1.5 text-[11px]",
              active ? "text-[#05070A]" : "text-muted hover:text-primary"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded bg-scan shadow-[0_0_12px_rgba(76,243,255,0.45)]"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
