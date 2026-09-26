import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { initDatabaseConnection } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(compression() as any);
  app.use(cors());
  app.use(express.json({ limit: '4mb' }));
  app.use(express.urlencoded({ extended: true, limit: '4mb' }));

  // Payload Limit & JSON Error Handler (Prevents FUNCTION_PAYLOAD_TOO_LARGE crashes)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err?.type === 'entity.too.large' || err?.status === 413) {
      return res.status(413).json({
        success: false,
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Ukuran payload data melebihi batas 4MB. Gunakan fitur upload file langsung ke cloud storage.',
      });
    }
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_JSON',
        message: 'Format payload JSON tidak valid.',
      });
    }
    next(err);
  });

  // API Routes FIRST
  app.use('/api', apiRouter);

  // Initialize Database connection in background
  initDatabaseConnection().catch(err => {
    console.warn('[Database] Background init warning:', err);
  });

  // Static dist for production or built preview vs Vite Middleware for development
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const useStaticDist = process.env.NODE_ENV === 'production' || (hasDist && process.env.VITE_DEV !== 'true');

  if (useStaticDist) {
    console.log('[Server] Serving optimized production static build from dist/');
    // Long-term immutable caching for hashed static assets, fresh checks for HTML
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        immutable: true,
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          } else if (filePath.match(/\.(js|css|woff2|woff|ttf|png|jpe?g|gif|svg|webp|avif|ico)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[Server] Mounting Vite development middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] WabupCup 2026 Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
