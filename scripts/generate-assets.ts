/**
 * Generate OG image, favicon, and apple icon for SEO.
 * Usage: npx tsx scripts/generate-assets.ts
 *
 * Creates:
 * - public/og.png (1200x630) - OpenGraph social sharing image
 * - public/favicon.svg - SVG favicon
 * - public/icon-192.png - PWA icon (placeholder)
 * - public/icon-512.png - PWA icon (placeholder)
 */

import { writeFileSync } from "fs";
import { join } from "path";

const PUBLIC = join(__dirname, "..", "public");

// -- OG Image as SVG (will be saved as .svg, referenced as og image) --
// For a proper PNG, you'd use @vercel/og or canvas. This creates a clean SVG
// that can be converted to PNG, or we use an SVG-based approach.

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#faf8f5"/>
  <rect x="0" y="0" width="1200" height="4" fill="#c0553a"/>

  <!-- Decorative circles suggesting tradition map nodes -->
  <circle cx="180" cy="280" r="6" fill="#c0553a" opacity="0.3"/>
  <circle cx="220" cy="320" r="4" fill="#b48c64" opacity="0.25"/>
  <circle cx="160" cy="350" r="5" fill="#8c8ca0" opacity="0.2"/>
  <circle cx="1020" cy="280" r="5" fill="#c0553a" opacity="0.25"/>
  <circle cx="1060" cy="330" r="4" fill="#b48c64" opacity="0.2"/>
  <circle cx="1000" cy="360" r="6" fill="#8c8ca0" opacity="0.3"/>

  <!-- Subtle connecting lines -->
  <line x1="180" y1="280" x2="220" y2="320" stroke="#b48c64" stroke-width="1" opacity="0.15"/>
  <line x1="220" y1="320" x2="160" y2="350" stroke="#8c8ca0" stroke-width="1" opacity="0.12" stroke-dasharray="4 3"/>
  <line x1="1020" y1="280" x2="1060" y2="330" stroke="#b48c64" stroke-width="1" opacity="0.15"/>
  <line x1="1060" y1="330" x2="1000" y2="360" stroke="#8c8ca0" stroke-width="1" opacity="0.12" stroke-dasharray="4 3"/>

  <!-- Title -->
  <text x="600" y="270" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#2a2a2a" font-weight="400">Lineage</text>

  <!-- Subtitle -->
  <text x="600" y="330" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" fill="#6a6560">A Map of Contemplative Traditions</text>

  <!-- URL -->
  <text x="600" y="400" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="#999">lineage.guide</text>

  <!-- Bottom accent line -->
  <rect x="540" y="360" width="120" height="1.5" fill="#c0553a" opacity="0.4" rx="1"/>
</svg>`;

writeFileSync(join(PUBLIC, "og.svg"), ogSvg);
console.log("✓ public/og.svg");

// -- Favicon SVG --
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#faf8f5"/>
  <text x="16" y="23" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="#2a2a2a" font-weight="600">L</text>
  <circle cx="8" cy="8" r="2.5" fill="#c0553a" opacity="0.7"/>
  <circle cx="24" cy="10" r="2" fill="#b48c64" opacity="0.6"/>
  <circle cx="16" cy="6" r="1.5" fill="#8c8ca0" opacity="0.5"/>
  <line x1="8" y1="8" x2="16" y2="6" stroke="#b48c64" stroke-width="0.8" opacity="0.3"/>
  <line x1="16" y1="6" x2="24" y2="10" stroke="#8c8ca0" stroke-width="0.8" opacity="0.3" stroke-dasharray="2 1.5"/>
</svg>`;

writeFileSync(join(PUBLIC, "favicon.svg"), faviconSvg);
console.log("✓ public/favicon.svg");

// -- Apple touch icon (simple SVG, browsers handle conversion) --
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="20" fill="#faf8f5"/>
  <text x="90" y="120" text-anchor="middle" font-family="Georgia, serif" font-size="100" fill="#2a2a2a" font-weight="400">L</text>
  <circle cx="45" cy="40" r="8" fill="#c0553a" opacity="0.6"/>
  <circle cx="135" cy="50" r="6" fill="#b48c64" opacity="0.5"/>
  <circle cx="90" cy="30" r="5" fill="#8c8ca0" opacity="0.4"/>
  <line x1="45" y1="40" x2="90" y2="30" stroke="#b48c64" stroke-width="1.5" opacity="0.25"/>
  <line x1="90" y1="30" x2="135" y2="50" stroke="#8c8ca0" stroke-width="1.5" opacity="0.25" stroke-dasharray="4 3"/>
</svg>`;

writeFileSync(join(PUBLIC, "apple-icon.svg"), appleSvg);
console.log("✓ public/apple-icon.svg");

// -- Web Manifest --
const manifest = {
  name: "Lineage",
  short_name: "Lineage",
  description: "An interactive map of contemplative traditions and a directory of teachers and centers.",
  start_url: "/",
  display: "standalone",
  background_color: "#faf8f5",
  theme_color: "#c0553a",
  icons: [
    { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    { src: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
  ],
};

writeFileSync(join(PUBLIC, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("✓ public/manifest.json");

console.log("\nDone. Note: For best OG image compatibility, convert og.svg to og.png (1200x630).");
console.log("Many social platforms don't support SVG for OG images.");
