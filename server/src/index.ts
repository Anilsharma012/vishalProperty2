import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import pageRoutes from './routes/pages';
import enquiryRoutes from './routes/enquiries';
import userRoutes from './routes/users';
import { notFound, onError } from './middleware/error';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: (origin, cb) => {
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
  return cb(new Error('CORS blocked')); }, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 200 }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(onError);

const PORT = Number(process.env.PORT || 4000);

connectDB(process.env.MONGODB_URI || '')
  .then(() => app.listen(PORT, () => console.log(`Server running on :${PORT}`)))
  .catch((err) => {
    console.error('DB connection failed', err);
    process.exit(1);
  });
