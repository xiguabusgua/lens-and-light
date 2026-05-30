import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { CategoryModel } from '../models/Category.js';
import { authenticateToken } from '../middleware/auth.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../types/index.js';

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
    const categories = await CategoryModel.findAll();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const input: CreateCategoryInput = req.body;

    if (!input.name || !input.slug) {
      res.status(400).json({ error: '缺少必填字段：name、slug' });
      return;
    }

    const existing = await CategoryModel.findBySlug(input.slug);
    if (existing) {
      res.status(409).json({ error: '分类 slug 已存在' });
      return;
    }

    const category = await CategoryModel.create(input);

    res.status(201).json({
      success: true,
      data: category,
      message: '分类创建成功'
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的分类 ID' });
      return;
    }

    const input: UpdateCategoryInput = req.body;
    const updated = await CategoryModel.update(id, input);

    if (!updated) {
      res.status(404).json({ error: '分类不存在' });
      return;
    }

    res.json({
      success: true,
      data: updated,
      message: '分类更新成功'
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的分类 ID' });
      return;
    }

    const category = await CategoryModel.findById(id);
    if (!category) {
      res.status(404).json({ error: '分类不存在' });
      return;
    }

    await CategoryModel.delete(id);

    res.json({
      success: true,
      message: '分类已删除'
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
