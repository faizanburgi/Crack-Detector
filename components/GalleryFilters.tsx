"use client";

import { Eye, Filter } from "lucide-react";
import SegmentedControl from "./SegmentedControl";
import type { FilterMode, ViewMode } from "@/lib/types";

export default function GalleryFilters({
  viewMode,
  onViewModeChange,
  filter,
  onFilterChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  filter: FilterMode;
  onFilterChange: (v: FilterMode) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Eye size={13} className="text-faint" />
        <SegmentedControl
          layoutId="view-mode-pill"
          size="sm"
          value={viewMode}
          onChange={onViewModeChange}
          options={[
            { label: "Original", value: "original" },
            { label: "Annotated", value: "annotated" },
          ]}
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter size={13} className="text-faint" />
        <SegmentedControl
          layoutId="filter-pill"
          size="sm"
          value={filter}
          onChange={onFilterChange}
          options={[
            { label: "All", value: "all" },
            { label: "Damaged", value: "damaged" },
            { label: "Clean", value: "clean" },
          ]}
        />
      </div>
    </div>
  );
}
