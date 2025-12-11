import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';

const router = Router();
const controller = new UploadController();

/**
 * POST /upload/preview
 * Save cropped image + text as temporary upload (24hr TTL)
 */
router.post(
  '/preview',
  controller.uploadPreview.bind(controller),
);

export default router;
