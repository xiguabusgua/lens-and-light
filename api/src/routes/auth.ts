import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import { LoginInput, AuthResponse } from '../types/index.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: '登录尝试过于频繁，请15分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, (req: Request, res: Response): void => {
  try {
    const { username, password }: LoginInput = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      res.status(500).json({ error: '服务器配置错误：未设置管理员凭据' });
      return;
    }

    if (username !== validUsername || password !== validPassword) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    const token = generateToken({ id: 1, username });

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: 1,
        username
      }
    };

    res.json(response);
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.get('/me', authenticateToken, (req: Request, res: Response): void => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
