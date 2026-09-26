import { Router, Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const r2Router = Router();

let s3ClientInstance: S3Client | null = null;

function getR2Client(): S3Client | null {
  if (s3ClientInstance) return s3ClientInstance;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  s3ClientInstance = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3ClientInstance;
}

/**
 * Endpoint to generate a presigned PUT URL for Cloudflare R2.
 * The browser uploads directly to Cloudflare R2 CDN, completely bypassing Vercel serverless payload limits.
 */
r2Router.post('/storage/presigned-url', async (req: Request, res: Response) => {
  try {
    const { filename, contentType, folder = 'registrations' } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Filename and contentType are required' });
    }

    const s3 = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME || 'wabupcup-storage';
    const publicDomain = (process.env.R2_PUBLIC_DOMAIN || '').replace(/\/+$/, '');

    // If Cloudflare R2 credentials are not configured yet, notify client to use lightweight fallback
    if (!s3 || !publicDomain) {
      return res.status(503).json({
        error: 'Cloudflare R2 belum dikonfigurasi di Environment Variables.',
        configured: false,
      });
    }

    const timestamp = Date.now();
    const sanitizedName = String(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    // Presigned URL valid for 15 minutes
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    const publicUrl = `${publicDomain}/${key}`;

    return res.status(200).json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    console.error('[Cloudflare R2 Presign Error]', error);
    return res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
  }
});
