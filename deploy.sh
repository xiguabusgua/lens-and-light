#!/bin/bash
#===========================================
# Lens & Light 自动部署脚本
# 用于初始化部署 或 手动触发部署
#===========================================

set -e

WEBROOT="/www/wwwroot/lens-and-light"
APIROOT="/www/wwwroot/lens-and-light-api"
NODE_USER="www"
NGINX_CONF="/www/server/panel/vhost/nginx"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查是否为 root
if [[ $EUID -ne 0 ]]; then
   log_error "请使用 root 权限运行此脚本"
   exit 1
fi

#===========================================
# 安装自动部署 Hook
#===========================================
install_deploy_hook() {
    log_info "安装自动部署 Git Hook..."

    # 创建 bare 仓库（如果没有）
    if [ ! -d "$WEBROOT/.git" ]; then
        log_info "初始化 Git 仓库..."
        cd "$WEBROOT"
        git init --bare
        git config core.bare false
        git config receive.denyCurrentBranch ignore
    fi

    # 创建 post-receive hook
    cat > "$WEBROOT/.git/hooks/post-receive" << 'HOOK'
#!/bin/bash
while read oldrev newrev refname; do
    branch=${refname##*/}
    if [ "$branch" = "main" ]; then
        echo ">>> 检测到 main 分支推送，开始自动部署..."
        
        GIT_WORK_TREE=/www/wwwroot/lens-and-light git checkout -f main
        
        echo ">>> 安装前端依赖..."
        cd /www/wwwroot/lens-and-light
        npm install --production
        
        echo ">>> 构建前端..."
        npm run build
        
        echo ">>> 重启 PM2 (前端)..."
        pm2 restart lens-and-light || pm2 start /www/wwwroot/lens-and-light/ecosystem.config.js --name lens-and-light
        
        echo ">>> 部署完成！"
    fi
done
HOOK

    chmod +x "$WEBROOT/.git/hooks/post-receive"
    log_info "Git Hook 安装成功！"
}

#===========================================
# 完整部署（手动触发）
#===========================================
deploy_all() {
    log_info "开始完整部署..."

    # 前端部署
    if [ -d "$WEBROOT" ]; then
        log_info ">>> 部署前端..."
        cd "$WEBROOT"
        git pull origin main
        npm install --production
        npm run build
        pm2 restart lens-and-light || pm2 start /www/wwwroot/lens-and-light/ecosystem.config.js --name lens-and-light
    fi

    # 后端部署
    if [ -d "$APIROOT" ]; then
        log_info ">>> 部署后端 API..."
        cd "$APIROOT"
        git pull origin main
        npm install --production
        pm2 restart lens-api || pm2 start /www/wwwroot/lens-and-light-api/ecosystem.config.cjs --name lens-api
    fi

    log_info "部署完成！前端: https://www.52akuya.asia"
}

#===========================================
# 仅前端部署
#===========================================
deploy_frontend() {
    log_info ">>> 部署前端..."
    cd "$WEBROOT"
    git pull origin main
    npm install --production
    npm run build
    pm2 restart lens-and-light || pm2 start /www/wwwroot/lens-and-light/ecosystem.config.js --name lens-and-light
    log_info "前端部署完成！"
}

#===========================================
# 仅后端部署
#===========================================
deploy_backend() {
    log_info ">>> 部署后端 API..."
    cd "$APIROOT"
    git pull origin main
    npm install --production
    pm2 restart lens-api || pm2 start /www/wwwroot/lens-and-light-api/ecosystem.config.cjs --name lens-api
    log_info "后端部署完成！"
}

#===========================================
# 初始化服务器
#===========================================
init_server() {
    log_info "初始化服务器环境..."

    # 安装 Node.js (如果没有)
    if ! command -v node &> /dev/null; then
        log_info "安装 Node.js 18..."
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    fi

    # 安装 PM2 (如果没有)
    if ! command -v pm2 &> /dev/null; then
        log_info "安装 PM2..."
        npm install -g pm2
    fi

    # 创建 www 用户（如果没有）
    if ! id -u www &>/dev/null; then
        useradd -m -s /bin/bash www
    fi

    # 设置目录权限
    chown -R www:www "$WEBROOT"
    chown -R www:www "$APIROOT"

    # 安装部署 Hook
    install_deploy_hook

    log_info "服务器初始化完成！"
}

#===========================================
# 查看状态
#===========================================
status() {
    log_info "PM2 状态:"
    pm2 list
    echo ""
    log_info "最近日志 (前20行):"
    pm2 logs lens-and-light --nostream --lines 20 2>/dev/null || echo "无日志"
}

#===========================================
# 回滚到上一个版本
#===========================================
rollback() {
    log_info "回滚到上一个版本..."
    cd "$WEBROOT"
    git reset --hard HEAD~1
    npm run build
    pm2 restart lens-and-light
    log_info "回滚完成！"
}

#===========================================
# 主菜单
#===========================================
case "${1:-help}" in
    init)
        init_server
        ;;
    install-hook)
        install_deploy_hook
        ;;
    deploy)
        deploy_all
        ;;
    deploy:frontend)
        deploy_frontend
        ;;
    deploy:backend)
        deploy_backend
        ;;
    status)
        status
        ;;
    rollback)
        rollback
        ;;
    help|*)
        echo "Lens & Light 部署脚本"
        echo ""
        echo "用法: bash deploy.sh <命令>"
        echo ""
        echo "命令:"
        echo "  init            - 初始化服务器环境（首次使用）"
        echo "  install-hook    - 安装自动部署 Git Hook"
        echo "  deploy          - 完整部署（前端+后端）"
        echo "  deploy:frontend - 仅部署前端"
        echo "  deploy:backend  - 仅部署后端"
        echo "  status          - 查看 PM2 状态和日志"
        echo "  rollback        - 回滚到上一个版本"
        echo "  help            - 显示帮助"
        echo ""
        ;;
esac