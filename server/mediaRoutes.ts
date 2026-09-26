import { Router, Request, Response } from 'express';
import { Database, AppMediaItem } from './db';

export const mediaRouter = Router();

// Daftar MIME type yang aman disajikan secara 'inline' (tampil langsung di browser/img)
const SAFE_INLINE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

/**
 * Helper to extract raw buffer from base64 or Data URI
 */
function decodeBase64File(fileData: string): { buffer: Buffer; mimeType?: string } {
  const matches = fileData.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    const mimeType = matches[1].toLowerCase();
    const buffer = Buffer.from(matches[2], 'base64');
    return { buffer, mimeType };
  }
  return { buffer: Buffer.from(fileData, 'base64') };
}

/**
 * 1. Upload Media
 */
mediaRouter.post('/media/upload', async (req: Request, res: Response) => {
  try {
    const { filename, contentType, fileData, category = 'REG_DOC', refId, subKey } = req.body;

    if (!filename || !fileData) {
      return res.status(400).json({ error: 'Filename and fileData are required' });
    }

    // Cek kasar panjang string: Base64 dari file ~3MB adalah sekitar 4.1 juta karakter
    // Batas aman total body JSON agar tidak crash di limit 4MB Express/Vercel
    if (fileData.length > 4.2 * 1024 * 1024) {
      return res.status(413).json({
        error: 'Ukuran berkas terlalu besar. Maksimal ukuran berkas adalah 3MB per upload.',
      });
    }

    const { buffer, mimeType } = decodeBase64File(fileData);
    let resolvedContentType = (contentType || mimeType || 'application/octet-stream').toLowerCase();
    const fileSize = buffer.length;

    // Batas riil file biner: 3MB (mencegah OOM di Node Serverless)
    if (fileSize > 3 * 1024 * 1024) {
      return res.status(413).json({
        error: 'Ukuran file murni melebihi batas 3MB. Silakan kompres dokumen terlebih dahulu.',
      });
    }

    // Sanitasi filename untuk mencegah path traversal atau karakter aneh
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const id = `med-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const mediaItem: AppMediaItem = {
      id,
      category,
      refId: refId || undefined,
      subKey: subKey || undefined,
      filename: sanitizedFilename,
      contentType: resolvedContentType,
      fileSize,
      fileData,
    };

    // Bersihkan file lama jika refId dan subKey sama (misal ganti logo tim)
    if (refId && subKey && typeof Database.deleteMediaByRefAndKey === 'function') {
      try {
        await Database.deleteMediaByRefAndKey(refId, subKey);
      } catch (cleanErr) {
        console.warn('[Media Replace Cleanup Warn]', cleanErr);
      }
    }

    await Database.saveMedia(mediaItem);

    const sizeInKb = (fileSize / 1024).toFixed(1);
    const sizeFormatted = fileSize > 1024 * 1024
      ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
      : `${sizeInKb} KB`;

    return res.status(201).json({
      id,
      url: `/api/media/view/${id}`,
      filename: sanitizedFilename,
      contentType: resolvedContentType,
      fileSize,
      sizeFormatted,
    });
  } catch (err: any) {
    console.error('[Media Upload Error]', err);
    return res.status(500).json({ error: err?.message || 'Gagal mengunggah berkas ke database' });
  }
});

/**
 * 2. Serve / View Media
 */
mediaRouter.get('/media/view/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send('ID media diperlukan');
    }

    const media = await Database.getMedia(id);
    if (!media || !media.fileData) {
      return res.status(404).send('Berkas tidak ditemukan');
    }

    const { buffer } = decodeBase64File(media.fileData);
    const rawType = (media.contentType || 'application/octet-stream').toLowerCase();

    // Pencegahan XSS: File selain gambar aman/PDF dipaksa download (attachment)
    const isSafeInline = SAFE_INLINE_MIME_TYPES.includes(rawType);
    const dispositionType = isSafeInline ? 'inline' : 'attachment';

    res.setHeader('Content-Type', isSafeInline ? rawType : 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Cegah browser menebak MIME secara liar
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(media.filename)}"`);

    return res.end(buffer);
  } catch (err: any) {
    console.error('[Media View Error]', err);
    return res.status(500).send('Gagal memuat berkas dari database');
  }
});

/**
 * 3. Delete Media by ID
 */
mediaRouter.delete('/media/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID media diperlukan' });
    }

    await Database.deleteMedia(id);
    return res.json({ success: true, message: 'Berkas berhasil dihapus' });
  } catch (err: any) {
    console.error('[Media Delete Error]', err);
    return res.status(500).json({ error: err?.message || 'Gagal menghapus berkas' });
  }
});

/**
 * 3b. Delete all media by reference ID
 */
mediaRouter.delete('/media/ref/:refId', async (req: Request, res: Response) => {
  try {
    const { refId } = req.params;
    if (!refId) {
      return res.status(400).json({ error: 'Reference ID diperlukan' });
    }

    await Database.deleteMediaByRef(refId);
    return res.json({ success: true, message: `Seluruh berkas terkait ${refId} berhasil dihapus` });
  } catch (err: any) {
    console.error('[Media Delete By Ref Error]', err);
    return res.status(500).json({ error: err?.message || 'Gagal menghapus berkas' });
  }
});

/**
 * 4. Status Media Storage
 */
mediaRouter.get('/media/status', async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'ready',
      storageEngine: 'DATABASE_MEDIA_STORAGE',
      table: 'app_media_storage',
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});