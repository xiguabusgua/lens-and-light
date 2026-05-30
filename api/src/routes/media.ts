import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth.js';
import { get, all, run } from '../config/database.js';

const router = Router();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const mediaUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: '上传过于频繁，请15分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});
const ABOUT_FILE = path.join(process.cwd(), 'data', 'about.json');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，仅允许 JPG/PNG/WebP/GIF'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: 'upload' | 'external';
  size?: number;
  createdAt: string;
  source?: string;
}

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const items: MediaItem[] = [];
    const seenUrls = new Set<string>();

    if (fs.existsSync(UPLOAD_DIR)) {
      const files = fs.readdirSync(UPLOAD_DIR).filter(f =>
        /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
      );

      files.forEach(filename => {
        const filePath = path.join(UPLOAD_DIR, filename);
        try {
          const stat = fs.statSync(filePath);
          items.push({
            id: `upload-${filename}`,
            url: `/uploads/${filename}`,
            filename,
            type: 'upload',
            size: stat.size,
            createdAt: stat.birthtime.toISOString(),
            source: '本地上传'
          });
          seenUrls.add(`/uploads/${filename}`);
        } catch {}
      });
    }

    try {
      const works = await all('SELECT id, image_url, thumbnail_url, title FROM works') as any[];

      works.forEach((work: any) => {
        [work.image_url, work.thumbnail_url].forEach((url: string) => {
          if (url && !seenUrls.has(url)) {
            seenUrls.add(url);
            items.push({
              id: `ext-work-${work.id}-${items.length}`,
              url,
              filename: url.split('/').pop() || url,
              type: 'external',
              createdAt: new Date().toISOString(),
              source: `作品：${work.title || '未命名'}`
            });
          }
        });
      });

      const albums = await all('SELECT id, cover_url, title FROM albums') as any[];

      albums.forEach((album: any) => {
        const url = album.cover_url;
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          items.push({
            id: `ext-album-${album.id}`,
            url,
            filename: url.split('/').pop() || url,
            type: 'external',
            createdAt: new Date().toISOString(),
            source: `相册：${album.title || '未命名'}`
          });
        }
      });
    } catch {}

    if (fs.existsSync(ABOUT_FILE)) {
      try {
        const aboutRaw = fs.readFileSync(ABOUT_FILE, 'utf-8');
        const aboutData = JSON.parse(aboutRaw);
        const avatarUrl = aboutData.avatarUrl;
        if (avatarUrl && !seenUrls.has(avatarUrl)) {
          seenUrls.add(avatarUrl);
          items.push({
            id: 'ext-about-avatar',
            url: avatarUrl,
            filename: avatarUrl.split('/').pop() || avatarUrl,
            type: 'external',
            createdAt: new Date().toISOString(),
            source: '关于页面头像'
          });
        }
      } catch {}
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, data: items, total: items.length });
  } catch (error) {
    console.error('获取媒体库失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/upload', authenticateToken, mediaUploadLimiter, upload.single('file'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '请选择要上传的图片' });
      return;
    }

    const item: MediaItem = {
      id: `upload-${req.file.filename}`,
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      type: 'upload',
      size: req.file.size,
      createdAt: new Date().toISOString(),
      source: '本地上传'
    };

    res.json({ success: true, data: item, message: '上传成功' });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.startsWith('upload-')) {
      res.status(400).json({ error: '只能删除本地上传的图片，外部链接请在对应作品中修改' });
      return;
    }

    const filename = id.replace('upload-', '');
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      try {
        const imageUrl = `/uploads/${safeFilename}`;
        await run("UPDATE works SET image_url = NULL WHERE image_url = ?", [imageUrl]);
        await run("UPDATE works SET thumbnail_url = NULL WHERE thumbnail_url = ?", [imageUrl]);
      } catch {}

      res.json({ success: true, message: '删除成功' });
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;
