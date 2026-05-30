import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: '留言发送过于频繁，请15分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', contactLimiter, (req: Request, res: Response): void => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: '请填写所有字段' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: '请提供有效的邮箱地址' });
      return;
    }

    console.log('\n📬 新的联系留言:');
    console.log(`   姓名: ${name}`);
    console.log(`   邮箱: ${email}`);
    console.log(`   留言: ${message}`);
    console.log(`   时间: ${new Date().toISOString()}\n`);

    res.json({ success: true, message: '留言发送成功！' });
  } catch (error) {
    console.error('联系留言处理错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
