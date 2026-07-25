"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CircleAlert, Loader2 } from "lucide-react";
import type { InspectionImage, ViewMode } from "@/lib/types";
import { cn, formatConfidence, severityStyles } from "@/lib/utils";
import BoundingBoxOverlay from "./BoundingBoxOverlay";
import StatusBadge from "./StatusBadge";

export default function ImageCard({
  image,
  viewMode,
  onSelect,
}: {
  image: InspectionImage;
  viewMode: ViewMode;
  onSelect: () => void;
}) {
  const s = severityStyles[image.severity];
  const clickable = image.status === "done" || image.status === "error";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
      onClick={clickable ? onSelect : undefined}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-panel transition-colors",
        clickable && "cursor-pointer hover:border-scan/40",
        image.status === "done" && image.severity === "critical"
          ? "border-alert/40"
          : "border-line"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-panel-raised">
        <img
          src={image.previewUrl}
          alt={image.file.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300",
            image.status === "processing" && "opacity-50",
            clickable && "group-hover:scale-[1.03]"
          )}
        />

        {image.status === "done" &&
          viewMode === "annotated" &&
          image.naturalWidth &&
          image.naturalHeight && (
            <BoundingBoxOverlay
              detections={image.detections}
              naturalWidth={image.naturalWidth}
              naturalHeight={image.naturalHeight}
            />
          )}

        <AnimatePresence>
          {image.status === "processing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-x-0 top-0 h-8 animate-scanline bg-gradient-to-b from-scan/60 via-scan/15 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-scrim/40">
                <Loader2 size={14} className="animate-spin text-scan" />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-scan">
                  Analyzing
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {image.status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-scrim/70 px-4 text-center">
            <CircleAlert size={16} className="text-alert" />
            <span className="font-mono text-[10px] text-alert">
              {image.errorMessage ?? "Inference failed"}
            </span>
          </div>
        )}

        {image.status === "queued" && (
          <div className="absolute inset-0 flex items-center justify-center bg-scrim/50">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/80">
              Queued
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-mono text-[11px] text-muted" title={image.file.name}>
            {image.file.name}
          </p>
          {image.status === "done" && <StatusBadge severity={image.severity} />}
        </div>

        {image.status === "done" && (
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-faint">
              {image.detections.length}{" "}
              {image.detections.length === 1 ? "crack" : "cracks"} detected
            </span>
            {image.avgConfidence !== undefined && image.detections.length > 0 && (
              <span className={s.text}>{formatConfidence(image.avgConfidence)}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
