import { Router } from 'express';
import { authenticate, authorize } from '../../middleware';
import * as controller from './geographic-objects.controller';

const router = Router();

router.use(authenticate);

// GET  /api/geographic-objects          — DKP filial o'z ob'yektlari
// GET  /api/geographic-objects/:id      — Bitta ob'yekt (barcha rollar ko'ra oladi)
// POST /api/geographic-objects          — Yangi ob'yekt + ariza yaratish (faqat dkp_filial)
// PATCH /api/geographic-objects/:id/geometry — Geometriyani yangilash (faqat dkp_filial)

router.get('/', controller.getMyObjects);
router.get('/:id', controller.getObjectById);
router.post('/', authorize('dkp_filial'), controller.createGeographicObject);
router.patch('/:id/geometry', authorize('dkp_filial'), controller.updateGeometry);

export default router;
