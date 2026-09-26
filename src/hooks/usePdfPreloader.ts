import { useState, useEffect, useRef, useCallback } from 'react';
import { useTournament } from '../context/TournamentContext';

export const PDF_CACHE_NAME = 'wabupcup-pdf-cache-v1';

// Shared in-memory Map of Object URLs for zero-latency synchronous access
const memoryBlobUrlMap = new Map<string, string>();
const memoryBlobMap = new Map<string, Blob>();

/**
 * Helper to check if a URL is already in the persistent Cache Storage
 */
async function isUrlInCache(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return memoryBlobMap.has(url);
  }
  try {
    const cache = await caches.open(PDF_CACHE_NAME);
    const match = await cache.match(url);
    return Boolean(match);
  } catch {
    return memoryBlobMap.has(url);
  }
}

/**
 * Helper to retrieve a cached Blob from persistent Cache Storage or memory
 */
export async function getCachedPdfBlob(url: string): Promise<Blob | null> {
  if (memoryBlobMap.has(url)) {
    return memoryBlobMap.get(url)!;
  }
  if (typeof window === 'undefined' || !('caches' in window)) {
    return null;
  }
  try {
    const cache = await caches.open(PDF_CACHE_NAME);
    const match = await cache.match(url);
    if (match) {
      const blob = await match.blob();
      memoryBlobMap.set(url, blob);
      if (!memoryBlobUrlMap.has(url)) {
        memoryBlobUrlMap.set(url, URL.createObjectURL(blob));
      }
      return blob;
    }
  } catch (err) {
    console.warn('[getCachedPdfBlob Error]', err);
  }
  return null;
}

/**
 * Helper to store a Blob into persistent Cache Storage
 */
export async function storePdfBlobInCache(url: string, blob: Blob): Promise<void> {
  memoryBlobMap.set(url, blob);
  if (!memoryBlobUrlMap.has(url)) {
    memoryBlobUrlMap.set(url, URL.createObjectURL(blob));
  }

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(PDF_CACHE_NAME);
      const response = new Response(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': blob.size.toString(),
          'X-Preloaded-At': new Date().toISOString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
      await cache.put(url, response);
    } catch (err) {
      console.warn('[storePdfBlobInCache Error]', err);
    }
  }
}

export interface UsePdfPreloaderOptions {
  urls?: string[]; // Specific URLs to preload (optional)
  enabled?: boolean; // Whether preloading is enabled (default: true)
  idleTimeout?: number; // Timeout for requestIdleCallback fallback (ms)
}

export interface PreloadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UsePdfPreloaderResult {
  preloadedUrls: string[];
  isPreloading: boolean;
  progress: PreloadProgress;
  isPreloaded: (url: string) => boolean;
  getCachedBlobUrl: (url: string) => string | null;
  preloadPdf: (url: string) => Promise<string | null>;
  clearPreloadCache: () => Promise<void>;
}

/**
 * usePdfPreloader Hook
 *
 * Mengunduh berkas PDF regulasi penting turnamen sebagai Blob selama waktu idle browser (initial idle time),
 * menyimpannya secara persisten ke browser Cache Storage (`wabupcup-pdf-cache-v1`) dan memory map lokal.
 * Mencegah roundtrip jaringan berulang saat user menavigasi, membuka modal regulasi, atau mengecek berkas.
 */
export function usePdfPreloader(options?: UsePdfPreloaderOptions): UsePdfPreloaderResult {
  const { config } = useTournament();
  const enabled = options?.enabled ?? true;
  const customUrls = options?.urls;
  const idleTimeout = options?.idleTimeout ?? 2500;

  const [preloadedList, setPreloadedList] = useState<string[]>([]);
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<PreloadProgress>({ loaded: 0, total: 0, percent: 0 });

  const hasExecutedRef = useRef(false);

  // 1. Kumpulkan daftar URL dokumen regulasi & template resmi turnamen
  const targetUrls = useCallback((): string[] => {
    if (customUrls && customUrls.length > 0) {
      return Array.from(new Set(customUrls.filter(Boolean)));
    }

    const collected: string[] = [];

    // Regulasi utama turnamen
    if (config.regulasiPdfUrl) {
      collected.push(config.regulasiPdfUrl);
    }

    // Formulir & surat pernyataan template
    if (config.formulirTemplateUrl) {
      collected.push(config.formulirTemplateUrl);
    }
    if (config.suratPernyataanTemplateUrl) {
      collected.push(config.suratPernyataanTemplateUrl);
    }

    // Dokumen penting dari config.downloadableDocs (PDF atau primary)
    if (config.downloadableDocs && Array.isArray(config.downloadableDocs)) {
      config.downloadableDocs.forEach((doc) => {
        if (doc.fileUrl && (doc.fileType === 'PDF' || doc.isPrimary || doc.fileName?.toLowerCase().endsWith('.pdf'))) {
          collected.push(doc.fileUrl);
        }
      });
    }

    return Array.from(new Set(collected.filter(Boolean)));
  }, [config, customUrls]);

  // 2. Preload berkas tunggal sebagai Blob
  const preloadPdf = useCallback(async (url: string): Promise<string | null> => {
    if (!url) return null;

    // Cek apakah sudah ada di memory map
    if (memoryBlobUrlMap.has(url)) {
      return memoryBlobUrlMap.get(url)!;
    }

    // Cek apakah sudah ada di persistent cache
    const existingBlob = await getCachedPdfBlob(url);
    if (existingBlob) {
      const blobUrl = URL.createObjectURL(existingBlob);
      memoryBlobUrlMap.set(url, blobUrl);
      setPreloadedList((prev) => (prev.includes(url) ? prev : [...prev, url]));
      return blobUrl;
    }

    // Handle Data URI Base64 tanpa request jaringan
    if (url.startsWith('data:')) {
      try {
        const parts = url.split(',');
        const mime = parts[0]?.match(/:(.*?);/)?.[1] || 'application/pdf';
        const binary = atob(parts[1] || '');
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mime });
        await storePdfBlobInCache(url, blob);
        const blobUrl = URL.createObjectURL(blob);
        memoryBlobUrlMap.set(url, blobUrl);
        setPreloadedList((prev) => (prev.includes(url) ? prev : [...prev, url]));
        return blobUrl;
      } catch (err) {
        console.warn('[Preload Base64 Parse Warn]', err);
        return null;
      }
    }

    // Unduh sebagai Blob dengan prioritas rendah (tidak mengganggu render halaman utama)
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/pdf,application/octet-stream,*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      await storePdfBlobInCache(url, blob);

      const blobUrl = URL.createObjectURL(blob);
      memoryBlobUrlMap.set(url, blobUrl);
      setPreloadedList((prev) => (prev.includes(url) ? prev : [...prev, url]));
      return blobUrl;
    } catch (err) {
      console.warn(`[usePdfPreloader] Preload failed for ${url}:`, err);
      return null;
    }
  }, []);

  // 3. Preload seluruh dokumen regulasi selama initial idle time
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Hormati mode Data Saver pengguna (jika aktif di browser HP)
    // @ts-expect-error navigator.connection non-standard check
    const isSaveData = navigator.connection?.saveData === true;
    if (isSaveData) {
      console.info('[usePdfPreloader] Data Saver aktif. Melewati preload otomatis.');
      return;
    }

    const urls = targetUrls();
    if (urls.length === 0) return;

    // Cek status cache yang sudah ada terlebih dahulu
    const checkExisting = async () => {
      const cached: string[] = [];
      for (const u of urls) {
        if (await isUrlInCache(u)) {
          cached.push(u);
        }
      }
      if (cached.length > 0) {
        setPreloadedList((prev) => Array.from(new Set([...prev, ...cached])));
      }
    };
    checkExisting();

    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    // Jalankan saat browser dalam kondisi idle (requestIdleCallback)
    const runIdlePreload = async () => {
      setIsPreloading(true);
      const total = urls.length;
      let loaded = 0;

      for (const url of urls) {
        try {
          const alreadyCached = await isUrlInCache(url);
          if (!alreadyCached) {
            await preloadPdf(url);
          }
        } catch (err) {
          console.warn('[Preload Item Warn]', err);
        } finally {
          loaded++;
          setProgress({
            loaded,
            total,
            percent: Math.round((loaded / total) * 100),
          });
        }
      }

      setIsPreloading(false);
    };

    let idleId: number | null = null;
    let timerId: NodeJS.Timeout | null = null;

    if ('requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(
        () => {
          runIdlePreload();
        },
        { timeout: idleTimeout }
      );
    } else {
      timerId = setTimeout(runIdlePreload, 1500);
    }

    return () => {
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, [enabled, targetUrls, preloadPdf, idleTimeout]);

  // 4. Helper untuk memeriksa apakah URL sudah ter-cache
  const isPreloaded = useCallback(
    (url: string): boolean => {
      return preloadedList.includes(url) || memoryBlobUrlMap.has(url);
    },
    [preloadedList]
  );

  // 5. Helper untuk mengambil Object URL dari memori (jika ada)
  const getCachedBlobUrl = useCallback((url: string): string | null => {
    return memoryBlobUrlMap.get(url) || null;
  }, []);

  // 6. Helper untuk membersihkan cache persisten
  const clearPreloadCache = useCallback(async () => {
    memoryBlobUrlMap.clear();
    memoryBlobMap.clear();
    setPreloadedList([]);
    setProgress({ loaded: 0, total: 0, percent: 0 });

    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        await caches.delete(PDF_CACHE_NAME);
      } catch (err) {
        console.warn('[clearPreloadCache Error]', err);
      }
    }
  }, []);

  return {
    preloadedUrls: preloadedList,
    isPreloading,
    progress,
    isPreloaded,
    getCachedBlobUrl,
    preloadPdf,
    clearPreloadCache,
  };
}
