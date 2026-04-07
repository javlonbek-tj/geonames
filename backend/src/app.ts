import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config';
import { globalErrorHandler } from './middleware';
import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use(globalErrorHandler);

export default app;
