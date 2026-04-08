import { Router } from 'express';
import { authenticate } from '../../middleware';
import { uploadMiddleware } from '../../middleware/upload';
import * as controller from './uploads.controller';

const router = Router();

router.use(authenticate);

// POST /api/uploads/applications/:applicationId
//   Body: multipart/form-data
//   Fields: file (required), documentType (optional)
//   Mumkin documentType qiymatlari:
//     dalolatnoma | district_commission_conclusion | regional_commission_conclusion
//     official_letter | decision_draft | expertise_conclusion | other
//
// GET  /api/uploads/applications/:applicationId  — Ariza hujjatlari ro'yxati
// DELETE /api/uploads/documents/:documentId      — Hujjatni o'chirish

router.post(
  '/applications/:applicationId',
  uploadMiddleware.single('file'),
  controller.uploadDocument,
);

router.get('/applications/:applicationId', controller.getDocuments);

router.delete('/documents/:documentId', controller.deleteDocument);

export default router;
