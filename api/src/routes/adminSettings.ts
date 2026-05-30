import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = Router();

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

const DEFAULT_THEME = {
  bg: '#0a0a0a',
  card: '#1f1f1f',
  raised: '#2d2d2d',
  table: '#141414',
  border: '#2d2d2d',
  borderLight: '#1f1f1f',
  text: '#fafafa',
  textMuted: '#a8a8a8',
  textDim: '#808080',
  textSubtle: '#555555',
  accent: '#c9a96e',
  accentHover: '#d4ba85',
  danger: '#ef4444',
  success: '#22c55e',
  backgroundImage: '',
};

function getTheme(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM admin_settings').all() as { key: string; value: string }[];
  const theme = { ...DEFAULT_THEME };
  for (const row of rows) {
    if (row.key.startsWith('theme_')) {
      const k = row.key.replace('theme_', '');
      (theme as Record<string, string>)[k] = row.value;
    }
  }
  return theme;
}

function updateSettings(settings: Record<string, string>): void {
  const upsert = db.prepare(
    'INSERT INTO admin_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const transaction = db.transaction((items: [string, string][]) => {
    for (const [key, value] of items) {
      upsert.run(key, value);
    }
  });
  const entries: [string, string][] = Object.entries(settings).map(([k, v]) => [`theme_${k}`, v]);
  transaction(entries);
}

router.get('/theme', (_req: Request, res: Response): void => {
  try {
    res.json({ success: true, data: getTheme() });
  } catch (error) {
    res.status(500).json({ error: '获取主题设置失败' });
  }
});

router.put('/theme', authenticateToken, (req: Request, res: Response): void => {
  try {
    const allowed = [
      'bg', 'card', 'raised', 'table', 'border', 'borderLight',
      'text', 'textMuted', 'textDim', 'textSubtle',
      'accent', 'accentHover', 'danger', 'success', 'backgroundImage',
    ];
    const settings: Record<string, string> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        settings[key] = String(req.body[key]);
      }
    }
    updateSettings(settings);
    res.json({ success: true, data: getTheme(), message: '主题设置已保存' });
  } catch (error) {
    res.status(500).json({ error: '保存主题设置失败' });
  }
});

router.post('/theme/background', authenticateToken, (req: Request, res: Response): void => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `admin_bg_${Date.now()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error('仅支持 JPG/PNG/WebP 格式'));
    },
  }).single('image');

  upload(req, res, (err: any) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: '请选择图片文件' });
      return;
    }
    updateSettings({ backgroundImage: `/uploads/${req.file.filename}` });
    res.json({
      success: true,
      data: { backgroundImage: `/uploads/${req.file.filename}` },
      message: '背景图已上传',
    });
  });
});

export default router;
