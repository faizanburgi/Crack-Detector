import type { Detection, InspectionImage } from "./types";
import { classifySeverity, uid } from "./utils";

const DEMO_WIDTH = 800;
const DEMO_HEIGHT = 600;

function placeholderSvg(label: string, sublabel: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${DEMO_WIDTH}" height="${DEMO_HEIGHT}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue},14%,15%)" />
        <stop offset="100%" stop-color="hsl(${hue},12%,7%)" />
      </linearGradient>
      <pattern id="hatch" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="26" stroke="hsl(${hue},18%,20%)" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="${DEMO_WIDTH}" height="${DEMO_HEIGHT}" fill="url(#g)" />
    <rect width="${DEMO_WIDTH}" height="${DEMO_HEIGHT}" fill="url(#hatch)" opacity="0.5" />
    <rect x="0" y="0" width="${DEMO_WIDTH}" height="${DEMO_HEIGHT}" fill="none" stroke="hsl(${hue},20%,24%)" stroke-width="10" />
    <text x="${DEMO_WIDTH / 2}" y="${DEMO_HEIGHT / 2 - 8}" font-family="monospace" font-size="26" fill="#4CF3FF" fill-opacity="0.65" text-anchor="middle">${label}</text>
    <text x="${DEMO_WIDTH / 2}" y="${DEMO_HEIGHT / 2 + 22}" font-family="monospace" font-size="14" fill="#7C8A9B" text-anchor="middle">${sublabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface DemoSpec {
  filename: string;
  label: string;
  sublabel: string;
  hue: number;
  boxes: { x1: number; y1: number; x2: number; y2: number; conf: number }[];
}

const DEMO_SPECS: DemoSpec[] = [
  {
    filename: "bridge_deck_north_span.jpg",
    label: "BRIDGE DECK — NORTH SPAN",
    sublabel: "demo sample",
    hue: 200,
    boxes: [
      { x1: 120, y1: 340, x2: 420, y2: 372, conf: 0.81 },
      { x1: 460, y1: 210, x2: 620, y2: 380, conf: 0.77 },
      { x1: 90, y1: 120, x2: 260, y2: 150, conf: 0.68 },
      { x1: 540, y1: 440, x2: 700, y2: 470, conf: 0.71 },
    ],
  },
  {
    filename: "pavement_section_a4.jpg",
    label: "PAVEMENT SECTION A4",
    sublabel: "demo sample",
    hue: 30,
    boxes: [{ x1: 220, y1: 260, x2: 520, y2: 300, conf: 0.58 }],
  },
  {
    filename: "retaining_wall_east.jpg",
    label: "RETAINING WALL — EAST",
    sublabel: "demo sample",
    hue: 265,
    boxes: [
      { x1: 300, y1: 90, x2: 340, y2: 480, conf: 0.63 },
      { x1: 500, y1: 200, x2: 560, y2: 400, conf: 0.44 },
    ],
  },
  {
    filename: "parking_structure_l3.jpg",
    label: "PARKING STRUCTURE L3",
    sublabel: "demo sample",
    hue: 150,
    boxes: [],
  },
  {
    filename: "culvert_inlet_07.jpg",
    label: "CULVERT INLET 07",
    sublabel: "demo sample",
    hue: 340,
    boxes: [
      { x1: 160, y1: 180, x2: 640, y2: 220, conf: 0.88 },
      { x1: 180, y1: 260, x2: 610, y2: 300, conf: 0.79 },
      { x1: 200, y1: 340, x2: 560, y2: 372, conf: 0.72 },
      { x1: 240, y1: 410, x2: 500, y2: 440, conf: 0.66 },
    ],
  },
  {
    filename: "sidewalk_grid_c12.jpg",
    label: "SIDEWALK GRID C12",
    sublabel: "demo sample",
    hue: 190,
    boxes: [],
  },
];

export function generateDemoImages(): InspectionImage[] {
  return DEMO_SPECS.map((spec) => {
    const detections: Detection[] = spec.boxes.map((b, idx) => ({
      id: `demo-${spec.filename}-${idx}`,
      className: "crack",
      confidence: b.conf,
      box: { x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2 },
    }));

    const avgConfidence =
      detections.length > 0
        ? detections.reduce((a, d) => a + d.confidence, 0) / detections.length
        : undefined;

    return {
      id: uid(),
      // A real File object is required by InspectionImage's type; demo rows
      // never touch the network, so this stub only ever supplies a filename.
      file: new File([], spec.filename, { type: "image/svg+xml" }),
      previewUrl: placeholderSvg(spec.label, spec.sublabel, spec.hue),
      status: "done",
      naturalWidth: DEMO_WIDTH,
      naturalHeight: DEMO_HEIGHT,
      detections,
      avgConfidence,
      severity: classifySeverity(detections),
    } satisfies InspectionImage;
  });
}
