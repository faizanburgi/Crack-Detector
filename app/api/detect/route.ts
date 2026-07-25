import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ULTRALYTICS_API_URL = process.env.ULTRALYTICS_API_URL;
const ULTRALYTICS_API_KEY = process.env.ULTRALYTICS_API_KEY;

// Default inference arguments; conf/iou can be overridden per-request by the
// tuning panel (still clamped below), imgsz stays fixed for this deployment.
const DEFAULT_ARGS = {
  conf: 0.25,
  iou: 0.7,
  imgsz: "640",
};

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

interface NormalizedDetection {
  id: string;
  className: string;
  confidence: number;
  box: { x1: number; y1: number; x2: number; y2: number };
}

/**
 * The Ultralytics predict endpoint's exact response envelope can vary by
 * export/deployment (raw `results`, HUB-style `images[].results`, or a flat
 * `predictions` array). We try the shapes we've seen in the wild and
 * normalize whichever one matches into a flat detection list, instead of
 * assuming a single fixed schema.
 */
function normalizeDetections(payload: any): NormalizedDetection[] {
  const candidates: any[] =
    payload?.images?.[0]?.results ??
    payload?.results ??
    payload?.predictions ??
    payload?.detections ??
    (Array.isArray(payload) ? payload : []) ??
    [];

  if (!Array.isArray(candidates)) return [];

  return candidates
    .map((item: any, idx: number): NormalizedDetection | null => {
      // Box may arrive as {x1,y1,x2,y2}, [x1,y1,x2,y2], or {x,y,width,height}
      let x1: number, y1: number, x2: number, y2: number;
      const box = item.box ?? item.bbox ?? item.xyxy;

      if (Array.isArray(box) && box.length >= 4) {
        [x1, y1, x2, y2] = box;
      } else if (box && "x1" in box) {
        ({ x1, y1, x2, y2 } = box);
      } else if (box && "x" in box && "width" in box) {
        x1 = box.x;
        y1 = box.y;
        x2 = box.x + box.width;
        y2 = box.y + box.height;
      } else if (
        "x1" in item &&
        "y1" in item &&
        "x2" in item &&
        "y2" in item
      ) {
        ({ x1, y1, x2, y2 } = item);
      } else {
        return null;
      }

      const className =
        item.name ?? item.class_name ?? item.label ?? item.class ?? "crack";
      const confidence = Number(
        item.confidence ?? item.conf ?? item.score ?? 0
      );

      return {
        id: `${idx}-${x1}-${y1}`,
        className: String(className),
        confidence,
        box: { x1: Number(x1), y1: Number(y1), x2: Number(x2), y2: Number(y2) },
      };
    })
    .filter((d): d is NormalizedDetection => d !== null);
}

export async function POST(req: NextRequest) {
  if (!ULTRALYTICS_API_URL || !ULTRALYTICS_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing ULTRALYTICS_API_URL or ULTRALYTICS_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const incomingForm = await req.formData();
    const file = incomingForm.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file provided under the 'file' field." },
        { status: 400 }
      );
    }

    // Tuning panel sends its current slider values with every upload; fall
    // back to the deployment defaults if they're missing, and clamp so a
    // malformed value can't reach the upstream model unbounded.
    const conf = clamp(
      Number(incomingForm.get("conf") ?? DEFAULT_ARGS.conf),
      0.05,
      0.95
    );
    const iou = clamp(
      Number(incomingForm.get("iou") ?? DEFAULT_ARGS.iou),
      0.05,
      0.95
    );

    const outgoingForm = new FormData();
    outgoingForm.append("file", file, (file as File).name ?? "upload.jpg");
    outgoingForm.append("conf", conf.toString());
    outgoingForm.append("iou", iou.toString());
    outgoingForm.append("imgsz", DEFAULT_ARGS.imgsz);

    const started = Date.now();

    const upstreamResponse = await fetch(ULTRALYTICS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ULTRALYTICS_API_KEY}`,
      },
      body: outgoingForm,
    });

    const inferenceMs = Date.now() - started;

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text().catch(() => "");
      return NextResponse.json(
        {
          error: `Inference endpoint returned ${upstreamResponse.status}.`,
          detail: errText.slice(0, 500),
        },
        { status: upstreamResponse.status }
      );
    }

    const raw = await upstreamResponse.json().catch(() => null);

    if (!raw) {
      return NextResponse.json(
        { error: "Inference endpoint returned a non-JSON response." },
        { status: 502 }
      );
    }

    const detections = normalizeDetections(raw);

    return NextResponse.json({
      detections,
      inferenceMs,
      paramsUsed: { conf, iou, imgsz: DEFAULT_ARGS.imgsz },
      raw, // kept for debugging/inspection; drop this in production if payload size is a concern
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error while running inference.", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
