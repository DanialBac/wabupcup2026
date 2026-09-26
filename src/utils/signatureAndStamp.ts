/**
 * Official Signature & Stamp Utility for Wabup Cup 2026
 * Contains the authentic vector signature of the Ketua Panitia (based on official document)
 * and the official circular red seal/stamp of the Wabup Cup 2026 Organizing Committee.
 */

// SVG Vector for Tanda Tangan Ketua Panitia (reconstructed from official TTD KETUA.png)
export const DEFAULT_SIGNATURE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 320" width="500" height="320">
  <g fill="none" stroke="#090d16" stroke-linecap="round" stroke-linejoin="round">
    <!-- Top left accent mark (<) -->
    <path d="M 125 50 C 108 45 102 52 115 58 C 128 62 138 60 142 55" stroke-width="5" />
    
    <!-- Long rising baseline slash from bottom-left to top-right -->
    <path d="M 15 305 C 75 240 160 175 255 115 C 320 75 390 45 480 18" stroke-width="5.5" />
    
    <!-- Upper parallel blade stroke -->
    <path d="M 160 170 C 225 125 315 75 425 35" stroke-width="4.5" />
    
    <!-- Top-right elongated capsule loop -->
    <path d="M 285 110 C 310 55 345 25 405 15 C 465 5 488 15 470 35 C 445 58 375 98 275 120" stroke-width="4.5" />
    
    <!-- Inner dashes in top-right capsule -->
    <path d="M 405 45 L 420 40" stroke-width="4.5" />
    <path d="M 415 52 L 432 47" stroke-width="4.5" />
    
    <!-- Ascending initial loop & central vertical needle -->
    <path d="M 172 90 C 176 100 170 175 160 240 C 158 255 158 265 165 265 C 174 265 182 200 190 140 C 195 100 205 85 218 88 C 228 92 232 145 225 195 C 222 225 235 240 258 230 C 282 220 300 170 295 100 C 290 50 275 45 252 80 C 235 110 230 180 230 215" stroke-width="5" />
    
    <!-- Lower comb/finger loops hanging down -->
    <path d="M 260 170 C 265 200 262 230 270 230 C 278 230 282 200 286 175 C 290 200 292 225 298 225 C 304 225 310 195 314 170 C 316 190 322 215 330 215 C 338 215 340 188 340 162" stroke-width="4.5" />
    
    <!-- Deep sweeping tail to bottom left -->
    <path d="M 176 90 C 170 120 168 175 165 230 C 162 255 158 275 152 275 C 145 275 150 230 160 180 C 165 155 165 130 168 102" stroke-width="5" />
  </g>
</svg>`;

// SVG Vector for Official Circular Cap/Stamp Wabup Cup 2026 (Red Seal)
export const DEFAULT_STAMP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <defs>
    <!-- Circular Paths for curved text -->
    <path id="stampTopArc" d="M 38 150 A 112 112 0 0 1 262 150" fill="none" />
    <path id="stampBottomArc" d="M 262 150 A 112 112 0 0 1 38 150" fill="none" />
  </defs>

  <g transform="rotate(-8 150 150)">
    <!-- Outer thick circular ring -->
    <circle cx="150" cy="150" r="138" fill="none" stroke="#be123c" stroke-width="4.5" stroke-opacity="0.95" />
    
    <!-- Middle thin decorative dotted circle -->
    <circle cx="150" cy="150" r="128" fill="none" stroke="#be123c" stroke-width="1.8" stroke-dasharray="5 2.5" stroke-opacity="0.88" />
    
    <!-- Inner boundary circle -->
    <circle cx="150" cy="150" r="88" fill="none" stroke="#be123c" stroke-width="2.5" stroke-opacity="0.92" />

    <!-- Top curved text: PANITIA PELAKSANA WABUP CUP -->
    <text font-family="'Arial Black', Arial, sans-serif" font-size="14.5" font-weight="900" fill="#be123c" fill-opacity="0.95" letter-spacing="2.5px">
      <textPath href="#stampTopArc" startOffset="50%" text-anchor="middle">
        PANITIA PELAKSANA WABUP CUP
      </textPath>
    </text>

    <!-- Bottom curved text: ★ BANYUWANGI 2026 ★ -->
    <text font-family="'Arial Black', Arial, sans-serif" font-size="14" font-weight="900" fill="#be123c" fill-opacity="0.95" letter-spacing="3.5px">
      <textPath href="#stampBottomArc" startOffset="50%" text-anchor="middle">
        ★ BANYUWANGI 2026 ★
      </textPath>
    </text>

    <!-- Center Content -->
    <!-- Stars on top -->
    <text x="150" y="102" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-size="10" font-weight="900" fill="#be123c" fill-opacity="0.88" letter-spacing="4px">
      ★ ★ ★
    </text>

    <!-- Sub-heading inside circle -->
    <text x="150" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#be123c" fill-opacity="0.9" letter-spacing="1px">
      TURNAMEN FUTSAL
    </text>

    <!-- Boxed Stamp: LUNAS -->
    <rect x="52" y="128" width="196" height="44" rx="4" fill="#be123c" fill-opacity="0.12" stroke="#be123c" stroke-width="2.8" stroke-opacity="0.95" />
    <text x="150" y="159" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-size="24" font-weight="900" fill="#be123c" fill-opacity="0.98" letter-spacing="5px">
      LUNAS
    </text>

    <!-- Bottom sub-heading inside circle -->
    <text x="150" y="194" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#be123c" fill-opacity="0.9" letter-spacing="1.5px">
      TERVERIFIKASI SAH
    </text>
    <text x="150" y="210" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-size="9" font-weight="bold" fill="#be123c" fill-opacity="0.8" letter-spacing="3px">
      ★ OFFICIAL ★
    </text>
  </g>
</svg>`;

/**
 * Converts an SVG string to a high-resolution PNG Data URL.
 * Works natively in browser environments using an offscreen canvas.
 */
export function svgToPngDataUrl(
  svgString: string,
  width: number,
  height: number,
  scale: number = 2
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // In non-browser / test environments, return a fallback SVG data URL
      const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
      resolve(encoded);
      return;
    }

    try {
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const urlHelper = window.URL || (window as any).webkitURL;
      const blobURL = urlHelper.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            urlHelper.revokeObjectURL(blobURL);
            resolve(dataUrl);
            return;
          }
        } catch (e) {
          console.warn('Canvas rasterization failed:', e);
        }
        urlHelper.revokeObjectURL(blobURL);
        resolve(blobURL);
      };

      img.onerror = () => {
        urlHelper.revokeObjectURL(blobURL);
        // Fallback to inline SVG data URL
        resolve('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString));
      };

      img.src = blobURL;
    } catch {
      resolve('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString));
    }
  });
}

// In-memory cache for generated PNG data URLs to avoid re-rasterizing
let cachedSignaturePng: string | null = null;
let cachedStampPng: string | null = null;

export async function getChairmanSignatureDataUrl(customSignature?: string): Promise<string> {
  if (customSignature && customSignature.trim().length > 0) {
    if (customSignature.startsWith('data:image/') || customSignature.startsWith('http')) {
      return customSignature;
    }
  }
  if (cachedSignaturePng) return cachedSignaturePng;
  const generated = await svgToPngDataUrl(DEFAULT_SIGNATURE_SVG, 500, 320, 2);
  if (generated.startsWith('data:image/png')) {
    cachedSignaturePng = generated;
  }
  return generated;
}

export async function getOfficialStampDataUrl(customStamp?: string): Promise<string> {
  if (customStamp && customStamp.trim().length > 0) {
    if (customStamp.startsWith('data:image/') || customStamp.startsWith('http')) {
      return customStamp;
    }
  }
  if (cachedStampPng) return cachedStampPng;
  const generated = await svgToPngDataUrl(DEFAULT_STAMP_SVG, 300, 300, 2);
  if (generated.startsWith('data:image/png')) {
    cachedStampPng = generated;
  }
  return generated;
}
