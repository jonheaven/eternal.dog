import { Request, Response, NextFunction } from 'express';
import { withRequest, logger } from '../utils/logger';

/**
 * Logger middleware: Injects req.logger into every request
 * Reduces boilerplate by eliminating need to:
 * 1. Extract requestId from req
 * 2. Create withRequest({ requestId }) in every handler
 * 
 * Usage in controllers:
 * async handleRequest(req: Request, res: Response) {
 *   const log = (req as any).logger;
 *   log.info('Handler executed');
 * }
 */
export function loggerMiddleware(req: Request, _res: Response, next: NextFunction) {
  const rid = (req as any).requestId;
  if (rid) {
    (req as any).logger = withRequest({ requestId: rid });
  } else {
    (req as any).logger = logger;
  }
  next();
}
