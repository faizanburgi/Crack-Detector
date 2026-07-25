"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ScanLine } from "lucide-react";
import type { FilterMode, InspectionImage, ViewMode } from "@/lib/types";
import ImageCard from "./ImageCard";

function matchesFilter(image: InspectionImage, filter: FilterMode) {
  if (filter === "all") return true;
  if (image.status !== "done") return false;
  if (filter === "damaged") return image.detections.length > 0;
  return image.detections.length === 0;
}

export default function Gallery({
  images,
  viewMode,
  filter,
  onSelect,
}: {
  images: InspectionImage[];
  viewMode: ViewMode;
  filter: FilterMode;
  onSelect: (id: string) => void;
}) {
  const filtered = images.filter((img) => matchesFilter(img, filter));

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line py-16 text-center">
        <ScanLine size={20} className="text-faint" />
        <p className="font-mono text-[11px] text-faint">
          No images in this batch yet — upload inspection photos, or load a demo batch, to begin scanning.
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line py-16 text-center">
        <ScanLine size={20} className="text-faint" />
        <p className="font-mono text-[11px] text-faint">
          No images match this filter.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnimatePresence mode="popLayout">
        {filtered.map((image) => (
          <motion.div key={image.id} layout>
            <ImageCard
              image={image}
              viewMode={viewMode}
              onSelect={() => onSelect(image.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
