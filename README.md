# CRACKSCAN — Infrastructure Crack-Detection Dashboard

A dark-mode batch inspection dashboard for civil infrastructure crack detection, built on Next.js 14 (App Router), Tailwind CSS, and Framer Motion. Images are POSTed to a Next.js API route, which proxies to your Ultralytics inference endpoint server-side so the API key never reaches the browser.

## Setup

```bash
npm install
```

The API endpoint and key are already configured in `.env.local`:

```
ULTRALYTICS_API_URL=https://predict-6a637274d6f746ffe055-dproatj77a-em.a.run.app/predict
ULTRALYTICS_API_KEY=ul_e4b5b71f143ab222c9327015b6a6d3e141d8dc45
```

`.env.local` is already listed in `.gitignore` — don't remove it from there, and don't commit this key to a public repo. If you ever paste this key into a shared chat, doc, or repo, rotate it in your Ultralytics account afterward.

## Run

```bash
npm run dev
```

Visit `http://localhost:3000`.

## How it works

- **`app/api/detect/route.ts`** — server-side route that receives one image at a time as `multipart/form-data`, forwards it to the Ultralytics endpoint with `conf=0.25`, `iou=0.7`, `imgsz=640`, and the `Authorization: Bearer <key>` header, then normalizes the response into a flat `{ id, className, confidence, box }[]` list.
- **`app/page.tsx`** — holds batch state, fires one inference request per uploaded file, and derives the header metrics (processed count, cracked count, average confidence, damage ratio) from the results.
- **`components/BoundingBoxOverlay.tsx`** — draws detections as an SVG layer sized to the image's natural pixel dimensions, so boxes line up regardless of how the thumbnail is scaled on screen.

## Adjusting to your model's exact response shape

`normalizeDetections()` in the API route tries several common Ultralytics response envelopes (`results`, `images[0].results`, `predictions`, `detections`, flat array) and several common box formats (`{x1,y1,x2,y2}`, `[x1,y1,x2,y2]`, `{x,y,width,height}`). The raw upstream payload is also returned under `raw` in the API response for one debugging pass — open your browser's network tab after your first real upload, compare `raw` against what `detections` produced, and tighten `normalizeDetections()` if your deployment uses a shape not covered here. Drop the `raw` field before shipping to production if response size matters.

## Severity thresholds

`classifySeverity()` in `lib/utils.ts` flags an image LOW / MODERATE / CRITICAL from crack count and peak confidence, and the header's damage-ratio indicator goes critical at a 30% batch damage ratio. Both are placeholder heuristics — tune them against real inspection data before using this for anything load-bearing.
