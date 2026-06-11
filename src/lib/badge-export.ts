/**
 * Carbon badge PNG generator.
 *
 * Generates a shareable 600×400 canvas PNG summarizing the user's footprint.
 * Runs entirely in the browser — no server, no external service.
 *
 * The badge adapts to light/dark preference via the `darkMode` flag.
 */

export interface BadgeData {
  totalTonnes: number;
  totalKg: number;
  targetTonnes: number;
  regionLabel: string;
  regionAverage: number;
  topCategory: string;
  topCategoryKg: number;
  year: number;
  darkMode?: boolean;
}

/** Draw text with automatic line wrapping, returns the new y position. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

/**
 * Render a 600×400 carbon badge to a canvas and return a PNG data URL.
 * Throws if canvas 2D API is unavailable (server-side / very old browser).
 */
export function generateBadgePng(data: BadgeData): string {
  const W = 600;
  const H = 400;
  const dark = data.darkMode ?? false;

  const canvas = document.createElement('canvas');
  canvas.width = W * 2; // retina
  canvas.height = H * 2;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.scale(2, 2); // retina scale

  // Colors
  const BG = dark ? '#080f0a' : '#f0fdf9';
  const CARD_BG = dark ? '#0d1a11' : '#ffffff';
  const PRIMARY = dark ? '#10b981' : '#059669';
  const INK = dark ? '#e2f5ee' : '#064e3b';
  const INK_MUTED = dark ? 'rgba(226,245,238,0.65)' : 'rgba(6,78,59,0.65)';
  const ACCENT = dark ? '#22d3ee' : '#0891b2';
  const BORDER = dark ? 'rgba(16,185,129,0.25)' : 'rgba(5,150,105,0.15)';

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Background gradient glow
  const grd = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H);
  grd.addColorStop(0, dark ? 'rgba(16,185,129,0.18)' : 'rgba(5,150,105,0.08)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Card
  const pad = 24;
  const cardX = pad;
  const cardY = pad;
  const cardW = W - pad * 2;
  const cardH = H - pad * 2;
  const r = 20;
  ctx.beginPath();
  ctx.moveTo(cardX + r, cardY);
  ctx.lineTo(cardX + cardW - r, cardY);
  ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
  ctx.lineTo(cardX + cardW, cardY + cardH - r);
  ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
  ctx.lineTo(cardX + r, cardY + cardH);
  ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
  ctx.lineTo(cardX, cardY + r);
  ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
  ctx.closePath();
  ctx.fillStyle = CARD_BG;
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const cx = cardX + 20;
  let cy = cardY + 28;

  // Logo leaf + Brand name
  ctx.fillStyle = PRIMARY;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('EcoTrace', cx + 18, cy + 2);
  ctx.fillStyle = INK_MUTED;
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('Carbon Footprint Summary', cx + 18, cy + 16);

  // Year badge
  ctx.fillStyle = PRIMARY + '22';
  ctx.fillRect(cardX + cardW - 70, cy - 8, 60, 22);
  ctx.fillStyle = PRIMARY;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText(String(data.year), cardX + cardW - 50, cy + 7);

  cy += 50;

  // Main number
  const tonnesStr = `${data.totalTonnes.toFixed(2)} t`;
  const co2Label = 'CO₂e / year';
  ctx.font = `bold 64px "Sora", system-ui, sans-serif`;
  ctx.fillStyle = INK;
  ctx.fillText(tonnesStr, cx, cy + 52);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = INK_MUTED;
  ctx.fillText(co2Label, cx + 4, cy + 72);

  cy += 90;

  // Divider
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cardX + cardW - 20, cy);
  ctx.stroke();
  cy += 18;

  // Stats row
  const stats = [
    { label: 'vs. 1.5°C target', value: `${(data.totalTonnes / data.targetTonnes).toFixed(1)}×` },
    {
      label: `vs. ${data.regionLabel} avg`,
      value: `${Math.round((data.totalTonnes / data.regionAverage) * 100)}%`,
    },
    { label: 'Top source', value: data.topCategory },
  ];

  const colW = (cardW - 40) / 3;
  stats.forEach((stat, i) => {
    const sx = cx + i * colW;
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = i === 0 ? PRIMARY : i === 1 ? ACCENT : INK;
    ctx.fillText(stat.value, sx, cy + 16);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = INK_MUTED;
    wrapText(ctx, stat.label, sx, cy + 30, colW - 8, 14);
  });

  cy += 60;

  // Footer
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = INK_MUTED;
  ctx.fillText('Data stays on your device. ecotrace.app', cx, cy + 12);
  ctx.fillStyle = PRIMARY;
  ctx.fillText('Built by Sauryadipta Bhattacharya', cardX + cardW - 200, cy + 12);

  return canvas.toDataURL('image/png');
}

/** Trigger a browser download of a PNG data URL. */
export function downloadPng(dataUrl: string, filename = 'ecotrace-carbon-badge.png'): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
