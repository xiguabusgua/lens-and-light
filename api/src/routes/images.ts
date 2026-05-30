import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const router = Router();

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

router.get('/thumb', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, w } = req.query;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: '缺少图片 URL' });
      return;
    }

    const fmt = req.query.fmt as string;
    const width = w ? parseInt(w as string) : 800;
    if (isNaN(width) || width < 100 || width > 2000) {
      res.status(400).json({ error: '宽度参数无效 (100-2000)' });
      return;
    }

    const cacheKey = `${url}_w${width}`;
    const cacheDir = path.resolve(UPLOAD_DIR, '.thumb_cache');
    const cacheFile = path.join(cacheDir, Buffer.from(cacheKey).toString('base64url') + '.webp');

    if (fs.existsSync(cacheFile)) {
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      fs.createReadStream(cacheFile).pipe(res);
      return;
    }

    let filePath: string;

    if (url.startsWith('/uploads/')) {
      filePath = path.resolve(UPLOAD_DIR, url.replace('/uploads/', ''));
    } else if (url.startsWith('http://localhost:3002/uploads/')) {
      filePath = path.resolve(UPLOAD_DIR, url.replace('http://localhost:3002/uploads/', ''));
    } else {
      res.status(400).json({ error: '不支持的图片路径' });
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: '图片不存在' });
      return;
    }

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const buffer = await sharp(filePath)
      .resize(width, undefined, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    fs.writeFileSync(cacheFile, buffer);

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
  } catch (error) {
    console.error('图片缩略图生成错误:', error);
    res.status(500).json({ error: '图片处理失败' });
  }
});

export default router;
