#!/usr/bin/env bash
set -e

# ====================================================
#  Lens & Light 摄影网站 - 一键部署脚本
#  适用环境：宝塔面板 / 任何带 Node.js 的 Linux 服务器
# ====================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Lens & Light 摄影网站 - 一键部署脚本${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# ---- 检查 Node.js ----
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ 未检测到 Node.js，请先安装 Node.js 18+${NC}"
  exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js 版本过低（当前 $(node -v)），需要 18+${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# ---- 检查 npm ----
if ! command -v npm &>/dev/null; then
  echo -e "${RED}❌ 未检测到 npm${NC}"
  exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# ---- 项目目录 ----
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
echo -e "${GREEN}📁 项目目录：${PROJECT_DIR}${NC}"
cd "$PROJECT_DIR"

# ---- 数据库配置 ----
echo ""
echo -e "${YELLOW}--- 数据库配置 ---${NC}"
echo "请填写 MySQL 连接信息（宝塔可以在「数据库」中一键创建）："

read -p "数据库主机 [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "数据库端口 [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "数据库用户名 [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "数据库密码: " DB_PASSWORD
echo ""

read -p "数据库名称 [lens_light]: " DB_NAME
DB_NAME=${DB_NAME:-lens_light}

# ---- 管理员账号 ----
echo ""
echo -e "${YELLOW}--- 管理员账号 ---${NC}"
read -p "管理员用户名 [admin]: " ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}

read -sp "管理员密码 [admin123]: " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
echo ""

# ---- 域名配置 ----
echo ""
echo -e "${YELLOW}--- 域名配置 ---${NC}"
read -p "网站域名（如 example.com，多个用逗号分隔）: " DOMAIN
if [ -z "$DOMAIN" ]; then
  echo -e "${RED}❌ 域名不能为空${NC}"
  exit 1
fi

CORS_ORIGIN="https://$DOMAIN"
if echo "$DOMAIN" | grep -q ','; then
  CORS_ORIGIN=""
  IFS=',' read -ra DOMAINS <<< "$DOMAIN"
  for d in "${DOMAINS[@]}"; do
    d=$(echo "$d" | xargs)
    [ -n "$CORS_ORIGIN" ] && CORS_ORIGIN="$CORS_ORIGIN,"
    CORS_ORIGIN="${CORS_ORIGIN}https://${d},http://${d}"
  done
else
  CORS_ORIGIN="https://${DOMAIN},http://${DOMAIN}"
fi

# ---- JWT 密钥 ----
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# ---- 写入 .env ----
echo ""
echo -e "${GREEN}📝 正在创建 api/.env ...${NC}"
cat > api/.env << EOF
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
JWT_SECRET=${JWT_SECRET}
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
PORT=3002
NODE_ENV=production
CORS_ORIGIN=${CORS_ORIGIN}
EOF
echo -e "${GREEN}✅ api/.env 已创建${NC}"

# ---- 创建必要目录 ----
mkdir -p api/uploads api/data

# ---- 安装前端依赖 & 构建 ----
echo ""
echo -e "${GREEN}📦 正在安装前端依赖...${NC}"
npm install --silent
echo -e "${GREEN}🔨 正在构建前端...${NC}"
npm run build
echo -e "${GREEN}✅ 前端构建完成 → dist/${NC}"

# ---- 安装后端依赖 & 编译 ----
echo ""
echo -e "${GREEN}📦 正在安装后端依赖...${NC}"
cd api
npm install --silent
echo -e "${GREEN}🔨 正在编译后端 TypeScript...${NC}"
npx tsc
cd "$PROJECT_DIR"
echo -e "${GREEN}✅ 后端编译完成 → api/dist/${NC}"

# ---- 创建数据库 & 建表 ----
echo ""
echo -e "${GREEN}🗄️  正在初始化数据库...${NC}"
cd api
node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: '${DB_HOST}',
    port: ${DB_PORT},
    user: '${DB_USER}',
    password: '${DB_PASSWORD}'
  });
  await conn.execute('CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  console.log('✅ 数据库 ${DB_NAME} 已就绪');
  await conn.end();
})();
" 2>&1 || echo -e "${YELLOW}⚠️  数据库可能已存在，跳过创建${NC}"

# 启动一次后端让 initializeDatabase 自动建表
echo -e "${GREEN}🔄 正在初始化数据表...${NC}"
timeout 10 node dist/index.js 2>/dev/null &
PID=$!
sleep 3
kill $PID 2>/dev/null || true
cd "$PROJECT_DIR"
echo -e "${GREEN}✅ 数据表已初始化${NC}"

# ---- PM2 配置 ----
echo ""
echo -e "${GREEN}⚙️  正在配置 PM2 进程守护...${NC}"

if command -v pm2 &>/dev/null; then
  pm2 delete lens-api 2>/dev/null || true
  pm2 start api/dist/index.js --name lens-api --cwd "$PROJECT_DIR/api"
  pm2 save
  echo ""
  echo -e "${GREEN}============================================${NC}"
  echo -e "${GREEN}🎉 部署完成！${NC}"
  echo ""
  echo -e "${BLUE}后端进程：${NC}已通过 PM2 启动（名称: lens-api）"
  echo -e "${BLUE}前端文件：${NC}${PROJECT_DIR}/dist/"
  echo -e "${BLUE}后台地址：${NC}https://${DOMAIN}/admin"
  echo -e "${BLUE}后台登录：${NC}${ADMIN_USERNAME} / ${ADMIN_PASSWORD}"
  echo ""
  echo -e "${YELLOW}--- 接下来需要在宝塔中操作 ---${NC}"
  echo ""
  echo -e "1️⃣  打开宝塔「网站」→ 添加站点"
  echo -e "   域名：${BLUE}${DOMAIN}${NC}"
  echo -e "   根目录：${BLUE}${PROJECT_DIR}/dist${NC}"
  echo "..."
  echo -e "2️⃣  站点设置 → 配置文件，在 server 块中加入："
  echo -e "${BLUE}"
  echo '   location / {'
  echo '       proxy_pass http://127.0.0.1:3002;'
  echo '       proxy_set_header Host $host;'
  echo '       proxy_set_header X-Real-IP $remote_addr;'
  echo '       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;'
  echo '   }'
  echo -e "${NC}"
  echo -e "3️⃣  站点设置 → SSL → Let's Encrypt → 申请证书"
  echo -e "4️⃣  开启「强制 HTTPS」"
  echo ""
  echo -e "${GREEN}============================================${NC}"
else
  echo -e "${YELLOW}⚠️  未检测到 pm2，请手动安装：npm install -g pm2${NC}"
  echo -e "${YELLOW}   然后执行：pm2 start api/dist/index.js --name lens-api${NC}"
fi
