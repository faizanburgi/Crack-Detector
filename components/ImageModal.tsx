"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Boxes } from "lucide-react";
import type { InspectionImage } from "@/lib/types";
import { formatConfidence, severityStyles, cn } from "@/lib/utils";
import BoundingBoxOverlay from "./BoundingBoxOverlay";
import StatusBadge from "./StatusBadge";

export default function ImageModal({
  image,
  onClose,
}: {
  image: InspectionImage | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line-bright bg-panel shadow-[0_0_60px_rgba(0,0,0,0.6)] lg:flex-row lg:max-h-[85vh]"
          >
            <div className="relative flex-1 bg-panel-raised">
              <img
                src={image.previewUrl}
                alt={image.file.name}
                className="h-full max-h-[45vh] w-full object-contain lg:max-h-[85vh]"
              />
              {image.naturalWidth && image.naturalHeight && (
                <BoundingBoxOverlay
                  detections={image.detections}
                  naturalWidth={image.naturalWidth}
                  naturalHeight={image.naturalHeight}
                />
              )}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-line-bright bg-scrim/70 text-white transition-colors hover:border-alert/50 hover:text-alert lg:hidden"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex w-full flex-col overflow-y-auto border-t border-line lg:w-80 lg:border-l lg:border-t-0">
              <div className="hidden items-center justify-between border-b border-line px-4 py-3 lg:flex">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Inspection detail
                </span>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-line-bright text-muted transition-colors hover:border-alert/50 hover:text-alert"
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <p
                    className="truncate font-mono text-xs text-muted"
                    title={image.file.name}
                  >
                    {image.file.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge severity={image.severity} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <StatTile
                    label="Detected cracks"
                    value={image.detections.length.toString()}
                  />
                  <StatTile
                    label="Peak confidence"
                    value={
                      image.detections.length > 0
                        ? formatConfidence(
                            Math.max(...image.detections.map((d) => d.confidence))
                          )
                        : "—"
                    }
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Boxes size={12} className="text-faint" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      Bounding boxes
                    </span>
                  </div>

                  {image.detections.length === 0 ? (
                    <p className="rounded-md border border-line bg-panel-raised px-3 py-3 font-mono text-[11px] text-faint">
                      No crack regions detected in this image.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {image.detections.map((d, i) => (
                        <li
                          key={d.id}
                          className={cn(
                            "flex items-center justify-between rounded-md border border-line bg-panel-raised px-2.5 py-2 font-mono text-[10.5px]",
                            d.confidence >= 0.75 ? "text-alert" : "text-scan"
                          )}
                        >
                          <span className="text-muted">#{i + 1}</span>
                          <span>
                            [{Math.round(d.box.x1)}, {Math.round(d.box.y1)}, {Math.round(d.box.x2)},{" "}
                            {Math.round(d.box.y2)}]
                          </span>
                          <span>{formatConfidence(d.confidence)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panel-raised px-3 py-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
        {label}
      </div>
      <div className="mt-0.5 font-display text-lg font-semibold text-primary text-numeric">
        {value}
      </div>
    </div>
  );
}
