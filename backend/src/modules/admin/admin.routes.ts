import { Router } from 'express';
import { authenticate, authorize } from '../../middleware';
import * as usersController from './users/users.controller';
import * as objectTypesController from './object-types/object-types.controller';

const router = Router();

// Barcha admin routelari himoyalangan
router.use(authenticate, authorize('admin'));

// ─── Foydalanuvchilar ─────────────────────────────────────────────────────────
// GET    /api/admin/users?page=1&limit=20&role=dkp_filial&search=ali
// GET    /api/admin/users/:id
// POST   /api/admin/users
// PATCH  /api/admin/users/:id
// PATCH  /api/admin/users/:id/reset-password
// DELETE /api/admin/users/:id

router.get('/users', usersController.getUsers);
router.get('/users/:id', usersController.getUser);
router.post('/users', usersController.createUser);
router.patch('/users/:id', usersController.updateUser);
router.patch('/users/:id/reset-password', usersController.resetPassword);
router.delete('/users/:id', usersController.deleteUser);

// ─── Ob'yekt kategoriyalari ───────────────────────────────────────────────────
// GET    /api/admin/object-categories
// POST   /api/admin/object-categories
// PATCH  /api/admin/object-categories/:id
// DELETE /api/admin/object-categories/:id

router.get('/object-categories', objectTypesController.getCategories);
router.post('/object-categories', objectTypesController.createCategory);
router.patch('/object-categories/:id', objectTypesController.updateCategory);
router.delete('/object-categories/:id', objectTypesController.deleteCategory);

// ─── Ob'yekt turlari ──────────────────────────────────────────────────────────
// GET    /api/admin/object-types?categoryId=1
// POST   /api/admin/object-types
// PATCH  /api/admin/object-types/:id
// DELETE /api/admin/object-types/:id

router.get('/object-types', objectTypesController.getTypes);
router.post('/object-types', objectTypesController.createType);
router.patch('/object-types/:id', objectTypesController.updateType);
router.delete('/object-types/:id', objectTypesController.deleteType);

export default router;
