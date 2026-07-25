"use client";

import { motion } from "framer-motion";
import type { Detection } from "@/lib/types";
import { formatConfidence } from "@/lib/utils";

export default function BoundingBoxOverlay({
  detections,
  naturalWidth,
  naturalHeight,
}: {
  detections: Detection[];
  naturalWidth: number;
  naturalHeight: number;
}) {
  if (!naturalWidth || !naturalHeight || detections.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {detections.map((d, i) => {
        const w = d.box.x2 - d.box.x1;
        const h = d.box.y2 - d.box.y1;
        const strokeW = Math.max(naturalWidth, naturalHeight) / 220;
        const isCritical = d.confidence >= 0.75;

        return (
          <g key={d.id}>
            <motion.rect
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              x={d.box.x1}
              y={d.box.y1}
              width={w}
              height={h}
              fill="none"
              stroke={isCritical ? "#FF3B5C" : "#4CF3FF"}
              strokeWidth={strokeW}
              rx={strokeW}
              style={{
                filter: `drop-shadow(0 0 ${strokeW * 1.5}px ${
                  isCritical ? "#FF3B5C" : "#4CF3FF"
                })`,
              }}
            />
            <rect
              x={d.box.x1}
              y={Math.max(d.box.y1 - naturalHeight * 0.032, 0)}
              width={Math.min(w, naturalWidth * 0.32)}
              height={naturalHeight * 0.032}
              fill={isCritical ? "#FF3B5C" : "#4CF3FF"}
            />
            <text
              x={d.box.x1 + naturalWidth * 0.006}
              y={
                Math.max(d.box.y1 - naturalHeight * 0.032, 0) +
                naturalHeight * 0.032 * 0.75
              }
              fontSize={naturalHeight * 0.022}
              fontFamily="var(--font-plex-mono), monospace"
              fontWeight={600}
              fill="#05070A"
            >
              {d.className} {formatConfidence(d.confidence)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
