import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import authRouter from './routes/auth.js';
import worksRouter from './routes/works.js';
import uploadRouter from './routes/upload.js';
import categoriesRouter from './routes/categories.js';
import tagsRouter from './routes/tags.js';
import albumsRouter from './routes/albums.js';
import aboutRouter from './routes/about.js';
import contactRouter from './routes/contact.js';
import mediaRouter from './routes/media.js';
import adminSettingsRouter from './routes/adminSettings.js';
import imagesRouter from './routes/images.js';
import { initializeDatabase } from './config/database.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

initializeDatabase();

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/works', worksRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/about', aboutRouter);
app.use('/api/contact', contactRouter);
app.use('/api/media', mediaRouter);
app.use('/api/admin', adminSettingsRouter);
app.use('/api/images', imagesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'API 服务运行正常',
    timestamp: new Date().toISOString()
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  console.error('错误:', err.stack);
  
  if (err.message === '不支持的文件类型，仅允许 JPG/PNG/WebP/GIF') {
    res.status(400).json({ error: err.message });
    return;
  }
  
  if (err.message.includes('File too large')) {
    res.status(400).json({ error: '文件大小超过限制（最大 10MB）' });
    return;
  }
  
  res.status(500).json({ 
    error: '服务器内部错误', 
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

export default app;
