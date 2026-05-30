import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AlbumModel } from '../models/Album.js';
import { authenticateToken } from '../middleware/auth.js';
import { CreateAlbumInput, UpdateAlbumInput } from '../types/index.js';

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', publicLimiter, async (_req: Request, res: Response): Promise<void> => {
  try {
    const albums = await AlbumModel.findAll();
    res.json({
      success: true,
      data: albums
    });
  } catch (error) {
    console.error('获取相册列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.get('/:slug', publicLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const album = await AlbumModel.findBySlug(slug);

    if (!album) {
      res.status(404).json({ error: '相册不存在' });
      return;
    }

    res.json({
      success: true,
      data: album
    });
  } catch (error) {
    console.error('获取相册详情错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.get('/:slug/works', publicLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const album = await AlbumModel.findBySlug(slug);

    if (!album) {
      res.status(404).json({ error: '相册不存在' });
      return;
    }

    const works = await AlbumModel.getWorksBySlug(slug);
    res.json({
      success: true,
      data: works
    });
  } catch (error) {
    console.error('获取相册作品错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const input: CreateAlbumInput = req.body;

    if (!input.title || !input.slug) {
      res.status(400).json({ error: '缺少必填字段：title、slug' });
      return;
    }

    const existing = await AlbumModel.findBySlug(input.slug);
    if (existing) {
      res.status(409).json({ error: '相册 slug 已存在' });
      return;
    }

    const album = await AlbumModel.create(input);

    res.status(201).json({
      success: true,
      data: album,
      message: '相册创建成功'
    });
  } catch (error) {
    console.error('创建相册错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的相册 ID' });
      return;
    }

    const input: UpdateAlbumInput = req.body;
    const updated = await AlbumModel.update(id, input);

    if (!updated) {
      res.status(404).json({ error: '相册不存在' });
      return;
    }

    res.json({
      success: true,
      data: updated,
      message: '相册更新成功'
    });
  } catch (error) {
    console.error('更新相册错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的相册 ID' });
      return;
    }

    const album = await AlbumModel.findById(id);
    if (!album) {
      res.status(404).json({ error: '相册不存在' });
      return;
    }

    await AlbumModel.delete(id);

    res.json({
      success: true,
      message: '相册已删除'
    });
  } catch (error) {
    console.error('删除相册错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/:id/works', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的相册 ID' });
      return;
    }

    const { work_id, sort_order } = req.body;

    if (!work_id) {
      res.status(400).json({ error: '缺少必填字段：work_id' });
      return;
    }

    const success = await AlbumModel.addWork(id, work_id, sort_order);

    if (!success) {
      const album = await AlbumModel.findById(id);
      if (!album) {
        res.status(404).json({ error: '相册不存在' });
        return;
      }
      res.status(409).json({ error: '作品已在此相册中或作品不存在' });
      return;
    }

    res.json({
      success: true,
      message: '作品已添加到相册'
    });
  } catch (error) {
    console.error('添加作品到相册错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.delete('/:id/works/:workId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const workId = parseInt(req.params.workId);

    if (isNaN(id) || isNaN(workId)) {
      res.status(400).json({ error: '无效的 ID' });
      return;
    }

    const album = await AlbumModel.findById(id);
    if (!album) {
      res.status(404).json({ error: '相册不存在' });
      return;
    }

    const success = await AlbumModel.removeWork(id, workId);

    if (!success) {
      res.status(404).json({ error: '作品不在该相册中' });
      return;
    }

    res.json({
      success: true,
      message: '作品已从相册移除'
    });
  } catch (error) {
    console.error('从相册移除作品错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
