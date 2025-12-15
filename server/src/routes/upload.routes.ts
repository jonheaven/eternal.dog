import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { UploadController } from '../controllers/upload.controller.js';

const router = Router();
const controller = new UploadController();

// Lenient rate limit for preview uploads during development
// In production, consider tightening this
const previewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 attempts per IP per hour
  skip: (req, res) => process.env.NODE_ENV === 'development', // Disable in development
  message: {
    error: 'Too many upload attempts, please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /upload/preview
 * Save cropped image + text as temporary upload (24hr TTL)
 */
router.post(
  '/preview',
  previewLimiter,
  controller.uploadPreview.bind(controller),
);

export default router;
