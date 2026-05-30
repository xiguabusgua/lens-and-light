import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const requiredEnvVars = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error(`❌ 缺少必要的环境变量: ${missing.join(', ')}`);
  console.error('请检查 .env 文件是否配置完整');
  process.exit(1);
}

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`
🚀 摄影作品集管理 API 服务已启动！
📍 地址: http://localhost:${PORT}
📚 API 文档:
   - POST /api/auth/login      - 用户登录
   - GET  /api/auth/me         - 获取当前用户
   - GET  /api/works           - 获取作品列表
   - GET  /api/works/:id       - 获取作品详情
   - POST /api/works           - 创建作品（需认证）
   - PUT  /api/works/:id       - 更新作品（需认证）
   - DELETE /api/works/:id     - 删除作品（需认证）
   - PUT  /api/works/reorder   - 批量排序（需认证）
   - POST /api/upload/image    - 上传图片（需认证）
   - DELETE /api/upload/:filename - 删除图片（需认证）
   - GET  /api/health          - 健康检查

⚙️  默认账号: admin / admin123
  `);
});
