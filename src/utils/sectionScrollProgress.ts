export function getScrollProgress(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  const total = document.body.scrollHeight - window.innerHeight;
  if (total <= 0) return 0;
  const progress = window.scrollY / total;
  return Math.max(0, Math.min(1, progress));
}

export function getSectionProgress(sectionId: string): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  const element = document.getElementById(sectionId);
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const total = viewportHeight + rect.height;
  const passed = viewportHeight - rect.top;
  const progress = passed / total;
  return Math.max(0, Math.min(1, progress));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const h = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

export function lerpColor(color1Hex: string, color2Hex: string, t: number): string {
  const c1 = hexToRgb(color1Hex);
  const c2 = hexToRgb(color2Hex);
  const clampedT = Math.max(0, Math.min(1, t));
  return rgbToHex(
    c1.r + (c2.r - c1.r) * clampedT,
    c1.g + (c2.g - c1.g) * clampedT,
    c1.b + (c2.b - c1.b) * clampedT,
  );
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
