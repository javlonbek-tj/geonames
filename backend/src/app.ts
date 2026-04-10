import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { ENV } from './config';
import { globalErrorHandler } from './middleware';
import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import locationsRoutes from './modules/locations/locations.routes';
import geographicObjectsRoutes from './modules/geographic-objects/geographic-objects.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import uploadsRoutes from './modules/uploads/uploads.routes';
import commissionRoutes from './modules/commission/commission.routes';
import publicRoutes from './modules/public/public.routes';

const app = express();

// CORS har qanday xatolikdan oldin ishlashi kerak
app.use(cors({ origin: [ENV.FRONTEND_URL, ENV.PUBLIC_FRONTEND_URL], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/geographic-objects', geographicObjectsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/public', publicRoutes);

// Yuklangan fayllarni statik ko'rsatish (faqat autentifikatsiyalangan)
// To'g'ridan-to'g'ri brauzerda ochilmasligi kerak bo'lsa, bu qatorni olib tashlash mumkin
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(globalErrorHandler);

export default app;
