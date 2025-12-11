import { Request, Response, NextFunction } from 'express';
import { logger, withRequest } from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const rid = (req as any).requestId as string | undefined;
  const log = rid ? withRequest({ requestId: rid }) : logger;

  const status = err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';
  const message = err.message || 'Internal Server Error';
  const details = isDev ? (err.stack || err) : undefined;

  log.error(`Error ${status}: ${message}`);

  res.status(status).json({
    requestId: rid,
    error: {
      message,
      details,
    },
  });
}
