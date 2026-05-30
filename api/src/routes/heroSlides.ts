import { Router, Request, Response } from 'express';
import { HeroSlideModel } from '../models/HeroSlide.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, sort, order } = req.query;
    
    const slides = await HeroSlideModel.findAll({
      status: status as string,
      sort: sort as string,
      order: (order as 'asc' | 'desc') || 'asc'
    });

    res.json({
      success: true,
      data: slides
    });
  } catch (error) {
    console.error('获取轮播图列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的轮播图 ID' });
      return;
    }

    const slide = await HeroSlideModel.findById(id);

    if (!slide) {
      res.status(404).json({ error: '轮播图不存在' });
      return;
    }

    res.json({
      success: true,
      data: slide
    });
  } catch (error) {
    console.error('获取轮播图详情错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      subtitle,
      image_url,
      description,
      button_text,
      button_link,
      transition_effect,
      transition_speed,
      autoplay_delay,
      sort_order,
      is_active
    } = req.body;

    if (!title || !image_url) {
      res.status(400).json({ error: '缺少必填字段：title、image_url' });
      return;
    }

    const newSlide = await HeroSlideModel.create({
      title,
      subtitle,
      image_url,
      description,
      button_text,
      button_link,
      transition_effect,
      transition_speed,
      autoplay_delay,
      sort_order,
      is_active
    });

    res.status(201).json({
      success: true,
      data: newSlide
    });
  } catch (error) {
    console.error('创建轮播图错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的轮播图 ID' });
      return;
    }

    const updatedSlide = await HeroSlideModel.update(id, req.body);

    if (!updatedSlide) {
      res.status(404).json({ error: '轮播图不存在' });
      return;
    }

    res.json({
      success: true,
      data: updatedSlide
    });
  } catch (error) {
    console.error('更新轮播图错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: '无效的轮播图 ID' });
      return;
    }

    const deleted = await HeroSlideModel.delete(id);

    if (!deleted) {
      res.status(404).json({ error: '轮播图不存在' });
      return;
    }

    res.json({
      success: true,
      message: '轮播图已删除'
    });
  } catch (error) {
    console.error('删除轮播图错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.put('/reorder', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      res.status(400).json({ error: 'orders 必须是一个数组' });
      return;
    }

    await HeroSlideModel.reorder(orders);

    res.json({
      success: true,
      message: '轮播图排序已更新'
    });
  } catch (error) {
    console.error('轮播图排序错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
