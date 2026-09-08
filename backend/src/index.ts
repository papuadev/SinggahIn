import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { sendSuccess } from './shared/utils/response.util';
import { notFoundHandler } from './shared/middleware/not-found.middleware';
import { errorHandler } from './shared/middleware/error.middleware';
import { identityRoutes } from './modules/identity/identity.routes';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Health Check Endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      service: 'SinggahIn Backend API',
      timestamp: new Date().toISOString()
    },
    'Layanan SinggahIn aktif dan berjalan normal.'
  );
});

// Domain Module Routes
app.use('/api/v1/identity', identityRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Global Central Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // Server running on configured PORT
  });
}
