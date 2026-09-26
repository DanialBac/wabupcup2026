import useSWRImmutable from 'swr/immutable';
import { getCachedPdfBlob, storePdfBlobInCache } from './usePdfPreloader';

/**
 * Helper to convert Base64 Data URI to ArrayBuffer
 */
function dataUriToArrayBuffer(dataUri: string): ArrayBuffer {
  const base64 = dataUri.split(',')[1] || dataUri;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Fetcher function to load PDF binary data as ArrayBuffer
 * Integrasi dengan Persistent Cache Storage:
 * 1. Cek cache persisten dari usePdfPreloader terlebih dahulu (0ms roundtrip)
 * 2. Jika belum ada, unduh via jaringan dan simpan ke persistent cache
 */
async function fetchPdfArrayBuffer(urlOrData: string): Promise<ArrayBuffer> {
  if (!urlOrData) {
    throw new Error('URL atau sumber berkas PDF kosong.');
  }

  // Handle Base64 Data URI directly without network fetch
  if (urlOrData.startsWith('data:')) {
    return dataUriToArrayBuffer(urlOrData);
  }

  // 1. Cek persistent Cache Storage (hasil preload usePdfPreloader)
  try {
    const cachedBlob = await getCachedPdfBlob(urlOrData);
    if (cachedBlob) {
      return await cachedBlob.arrayBuffer();
    }
  } catch (cacheErr) {
    console.warn('[usePdfLoader] Cache lookup fallback:', cacheErr);
  }

  // 2. Unduh dari jaringan
  const response = await fetch(urlOrData);
  if (!response.ok) {
    throw new Error(`Gagal mengunduh dokumen PDF (HTTP ${response.status} ${response.statusText})`);
  }

  const blob = await response.blob();
  
  // Simpan ke persistent cache untuk navigasi dan interaksi selanjutnya
  storePdfBlobInCache(urlOrData, blob).catch(() => {});

  return blob.arrayBuffer();
}

export interface UsePdfLoaderResult {
  data: ArrayBuffer | null;
  fileData: { data: Uint8Array } | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<ArrayBuffer | undefined>;
}

/**
 * usePdfLoader Hook
 *
 * Menggunakan SWR dengan cache permanen (staleTime: Infinity, dedupingInterval: Infinity, revalidate*: false)
 * untuk menyimpan ArrayBuffer dokumen PDF di memory RAM browser.
 * Mencegah duplikasi pemanggilan jaringan saat scrolling, zooming, atau re-render komponen.
 */
export function usePdfLoader(source: string | null | undefined): UsePdfLoaderResult {
  const cacheKey = source ? `pdf-buffer:${source}` : null;

  const { data, error, isLoading, mutate } = useSWRImmutable<ArrayBuffer>(
    cacheKey,
    source ? () => fetchPdfArrayBuffer(source) : null,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 31536000000, // 1 year (Infinity)
      keepPreviousData: true,
      staleTime: Infinity,
    } as any
  );

  return {
    data: data || null,
    fileData: data ? { data: new Uint8Array(data) } : null,
    isLoading: Boolean(source && isLoading && !data),
    error: error || null,
    mutate,
  };
}
