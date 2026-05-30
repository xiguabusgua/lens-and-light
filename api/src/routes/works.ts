import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { WorkModel } from '../models/Work.js';
import { TagModel } from '../models/Tag.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateInputLengths } from '../middleware/validate.js';
import { CreateWorkInput, UpdateWorkInput, ReorderItem } from '../types/index.js';

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', publicLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      featured,
      status,
      sort,
      order,
      page,
      limit,
      search,
      tag
    } = req.query;

    const result = await WorkModel.findAll({
      category: category as string,
      featured: featured as string,
      status: status as string,
      sort: sort as string,
      order: (order as 'asc' | 'desc') || 'asc',
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      search: search as string,
      tag: tag as string
    });

    res.json(result);
  } catch (error) {
    console.error('获取作品列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.get('/:id', publicLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的作品 ID' });
      return;
    }

    const work = await WorkModel.findById(id);

    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    res.json({
      success: true,
      data: work
    });
  } catch (error) {
    console.error('获取作品详情错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, validateInputLengths, async (req: Request, res: Response): Promise<void> => {
  try {
    const input: CreateWorkInput = req.body;

    if (!input.title || !input.category || !input.image_url) {
      res.status(400).json({ 
        error: '缺少必填字段：title、category、image_url'
      });
      return;
    }

    const { tag_ids, ...workInput } = input;

    const newWork = await WorkModel.create(workInput);

    if (tag_ids && Array.isArray(tag_ids) && tag_ids.length > 0) {
      await TagModel.setWorkTags(newWork.id, tag_ids as number[]);
      newWork.tag_list = await TagModel.getWorkTags(newWork.id);
    }

    res.status(201).json({
      success: true,
      data: newWork,
      message: '作品创建成功'
    });
  } catch (error) {
    console.error('创建作品错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, validateInputLengths, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的作品 ID' });
      return;
    }

    const { tag_ids, ...workInput } = req.body as UpdateWorkInput & { tag_ids?: number[] };

    const updatedWork = await WorkModel.update(id, workInput);

    if (!updatedWork) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    if (tag_ids !== undefined) {
      await TagModel.setWorkTags(id, tag_ids);
      updatedWork.tag_list = await TagModel.getWorkTags(id);
    }

    res.json({
      success: true,
      data: updatedWork,
      message: '作品更新成功'
    });
  } catch (error) {
    console.error('更新作品错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的作品 ID' });
      return;
    }

    const work = await WorkModel.findById(id);

    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    if (work.image_url) {
      const filename = path.basename(work.image_url);
      const filePath = path.join('./uploads', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (work.thumbnail_url) {
      const thumbnailFilename = path.basename(work.thumbnail_url);
      const thumbnailPath = path.join('./uploads', thumbnailFilename);
      
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await WorkModel.delete(id);

    res.json({
      success: true,
      message: '作品已删除'
    });
  } catch (error) {
    console.error('删除作品错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.put('/reorder', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { orders }: { orders: ReorderItem[] } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      res.status(400).json({ error: 'orders 必须是非空数组' });
      return;
    }

    for (const item of orders) {
      if (typeof item.id !== 'number' || typeof item.sort_order !== 'number') {
        res.status(400).json({ 
          error: '每个 order 项必须包含 id (number) 和 sort_order (number)'
        });
        return;
      }
    }

    await WorkModel.reorder(orders);

    res.json({
      success: true,
      message: '排序更新成功'
    });
  } catch (error) {
    console.error('排序更新错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
