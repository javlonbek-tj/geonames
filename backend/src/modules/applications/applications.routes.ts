import { Router } from 'express';
import { authenticate } from '../../middleware';
import * as controller from './applications.controller';

const router = Router();

router.use(authenticate);

// GET  /api/applications?page=&limit=&status=   — Rol bo'yicha tegishli arizalar
// GET  /api/applications/:id                    — Ariza + to'liq tarix
// GET  /api/applications/:id/actions            — Hozirgi foydalanuvchi bajara oladigan harakatlar
// POST /api/applications/:id/action             — Harakat bajarish (keyingi bosqichga o'tkazish)

router.get('/', controller.getApplications);
router.get('/:id', controller.getApplicationById);
router.get('/:id/actions', controller.getAvailableActions);
router.post('/:id/action', controller.performAction);

export default router;
