"use client";

import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ScanLine, RotateCcw } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import MetricsHeader from "@/components/MetricsHeader";
import Gallery from "@/components/Gallery";
import ControlPanel from "@/components/ControlPanel";
import GalleryFilters from "@/components/GalleryFilters";
import ImageModal from "@/components/ImageModal";
import type {
  BatchMetrics,
  Detection,
  FilterMode,
  InspectionImage,
  ViewMode,
} from "@/lib/types";
import { classifySeverity, exportBatchCsv, uid } from "@/lib/utils";
import { generateDemoImages } from "@/lib/demoData";

export default function Home() {
  const [images, setImages] = useState<InspectionImage[]>([]);
  const [confThreshold, setConfThreshold] = useState(0.25);
  const [iouThreshold, setIouThreshold] = useState(0.7);
  const [viewMode, setViewMode] = useState<ViewMode>("annotated");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const metrics: BatchMetrics = useMemo(() => {
    const done = images.filter((img) => img.status === "done");
    const totalProcessed = done.length;
    const cracked = done.filter((img) => img.detections.length > 0);
    const totalCracked = cracked.length;

    const allConfidences = cracked.flatMap((img) =>
      img.detections.map((d) => d.confidence)
    );
    const avgConfidence =
      allConfidences.length > 0
        ? (allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length) * 100
        : 0;

    const damageRatio =
      totalProcessed > 0 ? (totalCracked / totalProcessed) * 100 : 0;

    return { totalProcessed, totalCracked, avgConfidence, damageRatio };
  }, [images]);

  const runInference = useCallback(
    async (image: InspectionImage, conf: number, iou: number) => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, status: "processing" } : img
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", image.file);
        formData.append("conf", conf.toString());
        formData.append("iou", iou.toString());

        const res = await fetch("/api/detect", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Inference request failed.");
        }

        const detections: Detection[] = data.detections ?? [];
        const avgConfidence =
          detections.length > 0
            ? detections.reduce((a, d) => a + d.confidence, 0) / detections.length
            : undefined;

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: "done",
                  detections,
                  avgConfidence,
                  severity: classifySeverity(detections),
                  inferenceMs: data.inferenceMs,
                }
              : img
          )
        );
      } catch (err: any) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: "error",
                  errorMessage: String(err?.message ?? "Unknown error"),
                }
              : img
          )
        );
      }
    },
    []
  );

  const handleFilesAdded = useCallback(
    (files: File[]) => {
      const newImages: InspectionImage[] = files.map((file) => ({
        id: uid(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "queued",
        detections: [],
        severity: "none",
      }));

      setImages((prev) => [...newImages, ...prev]);

      // Capture the tuning-panel values at upload time so each image runs
      // with the sensitivity the user had dialed in when they dropped it.
      const conf = confThreshold;
      const iou = iouThreshold;

      newImages.forEach((image) => {
        const el = new Image();
        el.onload = () => {
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    naturalWidth: el.naturalWidth,
                    naturalHeight: el.naturalHeight,
                  }
                : img
            )
          );
        };
        el.src = image.previewUrl;
        runInference(image, conf, iou);
      });
    },
    [runInference, confThreshold, iouThreshold]
  );

  const handleLoadDemo = useCallback(() => {
    setImages((prev) => [...generateDemoImages(), ...prev]);
  }, []);

  const handleExportCsv = useCallback(() => {
    exportBatchCsv(images);
  }, [images]);

  const clearBatch = useCallback(() => {
    images.forEach((img) => {
      if (img.previewUrl.startsWith("blob:")) URL.revokeObjectURL(img.previewUrl);
    });
    setImages([]);
    setSelectedImageId(null);
  }, [images]);

  const selectedImage = images.find((img) => img.id === selectedImageId) ?? null;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-8 flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-scan/30 text-scan shadow-[0_0_16px_rgba(76,243,255,0.25)]">
            <ScanLine size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-primary md:text-[28px]">
              THE SENTINEL EYE
            </h1>
            <p className="mt-0.5 font-mono text-[11px] tracking-[0.08em] text-muted">
              Batch crack-detection dashboard for civil infrastructure inspections
            </p>
          </div>
        </div>

        {images.length > 0 && (
          <button
            onClick={clearBatch}
            className="flex items-center gap-1.5 self-start rounded-md border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition-colors hover:border-line-bright hover:text-primary md:self-auto"
          >
            <RotateCcw size={12} />
            Clear batch
          </button>
        )}
      </header>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <MetricsHeader metrics={metrics} />
      </motion.section>

      <section className="mb-6">
        <ControlPanel
          confThreshold={confThreshold}
          iouThreshold={iouThreshold}
          onConfChange={setConfThreshold}
          onIouChange={setIouThreshold}
          onLoadDemo={handleLoadDemo}
          onExportCsv={handleExportCsv}
          exportDisabled={images.length === 0}
        />
      </section>

      <section className="mb-8">
        <UploadZone onFilesAdded={handleFilesAdded} />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Batch gallery {images.length > 0 && `· ${images.length} image${images.length === 1 ? "" : "s"}`}
          </h2>
          <GalleryFilters
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>
        <Gallery
          images={images}
          viewMode={viewMode}
          filter={filter}
          onSelect={setSelectedImageId}
        />
      </section>

      <ImageModal image={selectedImage} onClose={() => setSelectedImageId(null)} />
    </main>
  );
}
