export type DetectionSeverity = "none" | "low" | "moderate" | "critical";
export type ViewMode = "original" | "annotated";
export type FilterMode = "all" | "damaged" | "clean";

export interface Detection {
  id: string;
  className: string;
  confidence: number; // 0–1
  box: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export type ImageStatus = "queued" | "processing" | "done" | "error";

export interface InspectionImage {
  id: string;
  file: File;
  previewUrl: string;
  status: ImageStatus;
  naturalWidth?: number;
  naturalHeight?: number;
  detections: Detection[];
  avgConfidence?: number;
  severity: DetectionSeverity;
  errorMessage?: string;
  inferenceMs?: number;
}

export interface BatchMetrics {
  totalProcessed: number;
  totalCracked: number;
  avgConfidence: number;
  damageRatio: number; // percentage 0–100
}
