import { Request, Response } from 'express';
import * as service from './geographic-objects.service';
import {
  createGeographicObjectSchema,
  updateGeometrySchema,
} from './geographic-objects.schema';
import { AppError } from '../../utils/appError';

export async function getMyObjects(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const result = await service.getMyObjects(req.user!, { page, limit });
  res.status(200).json({ status: 'success', ...result });
}

export async function getObjectById(req: Request, res: Response) {
  const data = await service.getObjectById(Number(req.params.id));
  res.status(200).json({ status: 'success', data });
}

export async function createGeographicObject(req: Request, res: Response) {
  const parsed = createGeographicObjectSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.createGeographicObjects(parsed.data, req.user!);
  res.status(201).json({ status: 'success', data });
}

export async function updateGeometry(req: Request, res: Response) {
  const parsed = updateGeometrySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.updateGeometry(
    Number(req.params.id),
    parsed.data,
    req.user!,
  );
  res.status(200).json({ status: 'success', data });
}
