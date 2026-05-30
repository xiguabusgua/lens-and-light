import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { TagModel } from '../models/Tag.js';
import { authenticateToken } from '../middleware/auth.js';
import { CreateTagInput, UpdateTagInput } from '../types/index.js';

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', publicLimiter, (req: Request, res: Response): void => {
  try {
    const { search } = req.query;
    const tags = TagModel.findAll(search as string);
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取标签列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, (req: Request, res: Response): void => {
  try {
    const input: CreateTagInput = req.body;

    if (!input.name || !input.slug) {
      res.status(400).json({ error: '缺少必填字段：name、slug' });
      return;
    }

    const tag = TagModel.create(input);
    if (!tag) {
      res.status(409).json({ error: '标签已存在' });
      return;
    }

    res.status(201).json({
      success: true,
      data: tag,
      message: '标签创建成功'
    });
  } catch (error) {
    console.error('创建标签错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的标签 ID' });
      return;
    }

    const input: UpdateTagInput = req.body;
    const updated = TagModel.update(id, input);

    if (!updated) {
      res.status(404).json({ error: '标签不存在' });
      return;
    }

    res.json({
      success: true,
      data: updated,
      message: '标签更新成功'
    });
  } catch (error) {
    console.error('更新标签错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的标签 ID' });
      return;
    }

    const tag = TagModel.findById(id);
    if (!tag) {
      res.status(404).json({ error: '标签不存在' });
      return;
    }

    TagModel.delete(id);

    res.json({
      success: true,
      message: '标签已删除'
    });
  } catch (error) {
    console.error('删除标签错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;