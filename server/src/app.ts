import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from './middleware/errorHandler.js';
import { withRequest, logger } from './utils/logger.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import statsRoutes from './routes/stats.routes.js';
import doginalRoutes from './routes/doginals.routes.js';
import { env } from './config/env.js';

export default function createApp(): Express {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
    })
  );
  // Attach a request ID and timestamp to each request
  app.use((req, _res, next) => {
    (req as any).requestId = uuidv4();
    (req as any).requestTime = new Date().toISOString();
    next();
  });
  // Respond with X-Request-ID header for client correlation
  app.use((req, res, next) => {
    const rid = (req as any).requestId;
    if (rid) res.setHeader('X-Request-ID', rid);
    next();
  });
  // Log requests with morgan including requestId and timestamp
  morgan.token('rid', (req: any) => req.requestId || '-');
  morgan.token('rtime', (req: any) => req.requestTime || '-');
  app.use(morgan(':rtime :rid :method :url :status :response-time ms'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.raw({ type: 'application/json', limit: '1mb' }));
  app.use(loggerMiddleware);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/ready', (_req, res) => res.json({ ready: true }));

  app.use('/upload', uploadRoutes);
  app.use('/payment', paymentRoutes);
  app.use('/stats', statsRoutes);
  app.use('/', doginalRoutes);

  // Centralized error handler last
  app.use(errorHandler);

  return app;
}
