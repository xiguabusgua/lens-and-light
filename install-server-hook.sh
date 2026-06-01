#!/bin/bash
# ====================================================
# 服务器一次性配置：安装自动部署 Git Hook
# 用法：scp install-server-hook.sh root@154.9.25.199:/tmp/
#       ssh root@154.9.25.199 "bash /tmp/install-server-hook.sh"
# ====================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; }

# 检查 root
if [ "$EUID" -ne 0 ]; then
  err "请用 root 运行: bash install-server-hook.sh"
  exit 1
fi

WEBROOT="/www/wwwroot/lens-and-light"
APIROOT="/www/wwwroot/lens-and-light-api"

log "开始配置服务器自动部署..."

# ---- 1. 备份已有项目 ----
if [ -d "$WEBROOT" ]; then
  warn "项目目录已存在，先备份..."
  mv "$WEBROOT" "${WEBROOT}.bak.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true
fi

# ---- 2. 创建 bare 仓库 ----
log "创建 Git 仓库..."
mkdir -p "$WEBROOT"
cd "$WEBROOT"
git init --bare
git config receive.denyCurrentBranch ignore
git config --local user.name "Server Deploy"
git config --local user.email "deploy@server.local"

# ---- 3. 写入 post-receive hook ----
log "安装 post-receive hook..."
cat > "$WEBROOT/hooks/post-receive" << 'HOOK_EOF'
#!/bin/bash
#===========================================
# 自动部署 Hook
# 收到 main 分支推送时执行
#===========================================
set -e

GREEN='\033[0;32m'
NC='\033[0m'
log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }

while read oldrev newrev refname; do
    branch=${refname##*/}
    if [ "$branch" != "main" ]; then
        continue
    fi

    log "=========================================="
    log "  收到 main 分支推送，开始自动部署"
    log "=========================================="

    # ---- 检出前端代码 ----
    log "[1/4] 检出代码..."
    cd /www/wwwroot/lens-and-light
    GIT_WORK_TREE=/www/wwwroot/lens-and-light git checkout -f main
    git --git-dir=/www/wwwroot/lens-and-light/.git --work-tree=/www/wwwroot/lens-and-light reset --hard main

    # ---- 安装前端依赖 & 构建 ----
    log "[2/4] 安装前端依赖并构建..."
    npm install --silent --no-audit --no-fund
    npm run build

    # ---- 重启前端 PM2 ----
    log "[3/4] 重启前端服务..."
    cd /www/wwwroot/lens-and-light
    if pm2 list | grep -q "lens-and-light"; then
        pm2 restart lens-and-light
    else
        # 启动静态服务（用 http-server 或 vite preview）
        pm2 start npx --name lens-and-light -- vite preview --port 3001 --host 0.0.0.0
    fi
    pm2 save

    # ---- 部署后端 API ----
    if [ -d "/www/wwwroot/lens-and-light-api" ] || [ -d "/www/wwwroot/lens-and-light/api" ]; then
        log "[4/4] 部署后端 API..."
        # 后端独立部署
        if [ -d "/www/wwwroot/lens-and-light-api" ]; then
            cd /www/wwwroot/lens-and-light-api
            git pull origin main 2>/dev/null || true
            npm install --silent --no-audit --no-fund
            npm run build
            if pm2 list | grep -q "lens-api"; then
                pm2 restart lens-api
            else
                pm2 start dist/index.js --name lens-api
            fi
            pm2 save
        fi
    fi

    log "=========================================="
    log "  ✅ 部署完成！"
    log "  前端: https://www.52akuya.asia"
    log "  后端: http://127.0.0.1:3002"
    log "=========================================="
done
HOOK_EOF

chmod +x "$WEBROOT/hooks/post-receive"

# ---- 4. 设置权限 ----
chown -R www:www "$WEBROOT" 2>/dev/null || true
chmod -R 755 "$WEBROOT"

# ---- 5. 验证 ----
log "验证安装..."
if [ -x "$WEBROOT/hooks/post-receive" ]; then
    log "✅ Hook 已安装并可执行"
    echo ""
    echo "=========================================="
    echo "  🎉 服务器配置完成！"
    echo "=========================================="
    echo ""
    echo "以后本地推送就行："
    echo "  bash push-to-server.sh \"你的提交信息\""
    echo ""
    echo "查看部署日志："
    echo "  ssh root@154.9.25.199 'tail -50 /var/log/ngrok.log'"
    echo "  或 Git push 时终端会显示部署进度"
    echo ""
    echo "PM2 状态："
    pm2 list 2>/dev/null || echo "  （首次部署后会有进程）"
    echo ""
    echo "⚠️  首次推送会创建工作树，"
    echo "    如果宝塔站点根目录不是 /www/wwwroot/lens-and-light，"
    echo "    部署完成后需要在宝塔面板修改站点根目录。"
    echo "=========================================="
else
    err "Hook 安装失败，请检查权限"
    exit 1
fi