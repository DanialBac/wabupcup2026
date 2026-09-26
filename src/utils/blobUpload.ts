import { compressImage, compressLogo } from './imageCompressor';

export interface UploadResult {
  url: string;
  name: string;
  size: string;
  type: string;
  fileData?: string; // Optional fallback
}

/**
 * Reads file as Base64 Data URL
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Centralized Storage in TiDB Cloud:
 * Uploads media (logos, PDF docs, CMS images) file-by-file directly into
 * the TiDB Cloud `app_media_storage` table via /api/media/upload.
 * Fast, centralized, zero external dependencies, with automatic cascading cleanup.
 */
export async function uploadToTiDbStorage(
  file: File,
  folder = 'registrations',
  onProgress?: ((percent: number) => void) | string,
  refId?: string,
  subKey?: string
): Promise<UploadResult> {
  // Support flexible argument order if onProgress was passed directly as refId string
  let progressFn: ((percent: number) => void) | undefined;
  let finalRefId = refId;
  let finalSubKey = subKey;

  if (typeof onProgress === 'function') {
    progressFn = onProgress;
  } else if (typeof onProgress === 'string') {
    finalSubKey = refId;
    finalRefId = onProgress;
    progressFn = undefined;
  }

  let base64Data = '';
  let contentType = file.type || 'application/octet-stream';

  if (progressFn) progressFn(20);

  // Map folder to semantic category
  let category = 'REG_DOC';
  if (folder.includes('logo') || folder === 'logos') {
    category = 'TEAM_LOGO';
  } else if (folder.includes('sponsor') || folder === 'sponsors') {
    category = 'SPONSOR_LOGO';
  } else if (folder.includes('wallpaper') || folder.includes('background') || folder === 'cms') {
    category = 'CMS_WALLPAPER';
  } else if (folder.includes('download') || folder.includes('doc')) {
    category = 'CMS_DOC';
  }

  // Pre-compress images client-side for lightning fast speed & minimal DB footprint
  if (file.type.startsWith('image/')) {
    try {
      if (category === 'TEAM_LOGO' || category === 'SPONSOR_LOGO') {
        base64Data = await compressLogo(file, 400, 0.85);
      } else if (category === 'CMS_WALLPAPER') {
        base64Data = await compressImage(file, 1920, 1080, 0.82);
      } else {
        base64Data = await compressImage(file, 1600, 1200, 0.82);
      }
      contentType = 'image/jpeg';
    } catch {
      base64Data = await readFileAsDataUrl(file);
    }
  } else {
    base64Data = await readFileAsDataUrl(file);
  }

  if (progressFn) progressFn(50);

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType,
      fileData: base64Data,
      category,
      refId: finalRefId || undefined,
      subKey: finalSubKey || undefined,
    }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Gagal menyimpan berkas ke TiDB Cloud (${res.status})`);
  }

  const data = await res.json();
  if (progressFn) progressFn(100);

  return {
    url: data.url, // e.g. /api/media/view/med-123456
    name: data.filename || file.name,
    size: data.sizeFormatted || `${(file.size / 1024).toFixed(1)} KB`,
    type: data.contentType || contentType,
    fileData: data.url,
  };
}

/**
 * Universal file uploader:
 * Centralized in TiDB Cloud.
 * Fallback to direct client-side compressed base64 if server is temporarily unreachable.
 */
export async function uploadFileToBlob(
  file: File,
  folder = 'registrations',
  onProgress?: (percent: number) => void,
  refId?: string,
  subKey?: string
): Promise<UploadResult> {
  try {
    return await uploadToTiDbStorage(file, folder, onProgress, refId, subKey);
  } catch (err: any) {
    console.warn('[TiDB Cloud Storage Upload] Server upload encountered an issue, using client-side fallback:', err?.message || err);

    // Fallback: Client-side compression
    if (file.type.startsWith('image/')) {
      try {
        const compressed = await (folder.includes('logo')
          ? compressLogo(file, 400, 0.85)
          : compressImage(file, 1600, 1200, 0.82));
        const approxKb = (compressed.length * 0.75 / 1024).toFixed(1);
        if (onProgress) onProgress(100);
        return {
          url: compressed,
          name: file.name,
          size: `${approxKb} KB`,
          type: 'image/jpeg',
          fileData: compressed,
        };
      } catch {}
    }

    const base64 = await readFileAsDataUrl(file);
    const sizeInKb = (file.size / 1024).toFixed(1);
    if (onProgress) onProgress(100);
    return {
      url: base64,
      name: file.name,
      size: `${sizeInKb} KB`,
      type: file.type || 'application/pdf',
      fileData: base64,
    };
  }
}

/**
 * Helper to delete media by URL or ID from TiDB Cloud
 */
export async function deleteMediaFromStorage(urlOrId: string): Promise<boolean> {
  try {
    if (!urlOrId || typeof urlOrId !== 'string') return false;
    let mediaId = urlOrId.trim();

    const directMatch = mediaId.match(/\b(med-\d+-[a-zA-Z0-9_-]+)\b/);
    if (directMatch) {
      mediaId = directMatch[1];
    } else if (mediaId.includes('/api/media/view/')) {
      mediaId = mediaId.split('/api/media/view/')[1].split(/[?#]/)[0];
    }

    if (!mediaId.startsWith('med-')) return false;

    const res = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn('[deleteMediaFromStorage warning]', err);
    return false;
  }
}
