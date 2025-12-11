import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from './middleware/errorHandler';
import { withRequest, logger } from './utils/logger';
import { loggerMiddleware } from './middleware/logger.middleware';
import uploadRoutes from './routes/upload.routes';
import paymentRoutes from './routes/payment.routes';
import statsRoutes from './routes/stats.routes';
import doginalRoutes from './routes/doginals.routes';
import rateLimitMiddleware from './middleware/rateLimit.middleware';

export default function createApp(): Express {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  }));
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
  app.use(
    express.raw({ type: 'application/json', limit: '1mb' }),
  );
  app.use(rateLimitMiddleware);
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
