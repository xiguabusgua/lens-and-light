import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const CONFIG_FILE = path.join(process.cwd(), 'data', 'about.json');

const defaultAboutData = {
  name: '陈明远',
  title: '视觉叙事者 / Visual Storyteller',
  bio: `从事专业摄影十五年，专注于通过镜头捕捉生命中的诗意瞬间。我相信每张照片都是一个故事的开始，每次快门的按下都是一次与时间的对话。

从人文纪实到商业影像，从自然风光到时尚人像，我始终保持着对光的敏感和对美的追求。作品曾发表于《国家地理》、《VOGUE》等国内外权威媒体，并多次在国际摄影大赛中获奖。

对我而言，摄影不仅是一种技术，更是一种观看世界的方式——它教会我慢下来，去发现那些被忽略的美好，去感受当下最真实的情感流动。`,
  philosophy: '"摄影是在一瞬间内，同时认识到事件本身的意义，以及组织这一事件的形式结构。 —— 亨利·卡蒂埃-布列松"',
  avatarUrl: 'https://picsum.photos/seed/photographer/400/533',
  stats: {
    years: 15,
    projects: 1200,
    clients: 350,
    awards: 28
  },
  timeline: [
    { year: '2009', title: '开启摄影之路', description: '获得第一台单反相机，开始自学摄影' },
    { year: '2013', title: '成为自由摄影师', description: '辞去稳定工作，全身心投入摄影创作' },
    { year: '2016', title: '首个国际奖项', description: '获索尼世界摄影大赛优秀奖' },
    { year: '2019', title: '个人展览举办', description: '在上海当代艺术馆举办首次个展' },
    { year: '2022', title: '品牌合作拓展', description: '与多个国际奢侈品牌建立合作' },
    { year: '2024', title: '新书出版', description: '出版摄影集《瞬间的永恒》' }
  ],
  services: [
    { icon: 'UserCircle', title: '个人写真', description: '为您打造专属形象照', priceRange: '¥3,000 - ¥8,000' },
    { icon: 'Building2', title: '商业拍摄', description: '为企业提供专业摄影服务', priceRange: '¥8,000 - ¥30,000' },
    { icon: 'Calendar', title: '活动记录', description: '婚礼、发布会等全程记录', priceRange: '¥5,000 - ¥20,000' }
  ]
};

function ensureConfigFile() {
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultAboutData, null, 2), 'utf-8');
  }
}

function readConfig() {
  ensureConfigFile();
  const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeConfig(data: any) {
  ensureConfigFile();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

router.get('/', (_req: Request, res: Response): void => {
  try {
    const data = readConfig();
    res.json({ success: true, data });
  } catch (error) {
    console.error('读取关于数据失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.put('/', authenticateToken, (req: Request, res: Response): void => {
  try {
    const data = req.body;
    
    if (!data.name || !data.title) {
      res.status(400).json({ error: '姓名和标题不能为空' });
      return;
    }

    writeConfig(data);
    res.json({ success: true, message: '保存成功', data });
  } catch (error) {
    console.error('保存关于数据失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
