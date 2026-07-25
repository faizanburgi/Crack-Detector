"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { UploadCloud, ScanEye } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadZone({
  onFilesAdded,
}: {
  onFilesAdded: (files: File[]) => void;
}) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFilesAdded(accepted);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
        isDragActive
          ? "border-scan bg-scan/[0.06]"
          : "border-line hover:border-line-bright hover:bg-panel/60"
      )}
    >
      <input {...getInputProps()} />

      <motion.div
        animate={isDragActive ? { scale: 1.08 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border",
          isDragActive
            ? "border-scan text-scan shadow-[0_0_20px_rgba(76,243,255,0.35)]"
            : "border-line-bright text-muted group-hover:text-scan group-hover:border-scan/50"
        )}
      >
        {isDragActive ? <ScanEye size={20} /> : <UploadCloud size={20} />}
      </motion.div>

      <div>
        <p className="font-display text-sm font-medium text-primary">
          {isDragActive ? "Release to queue for inspection" : "Drop inspection images, or click to browse"}
        </p>
        <p className="mt-1 font-mono text-[11px] text-muted">
          Multi-image batch upload · JPG, PNG, WEBP
        </p>
      </div>
    </div>
  );
}
