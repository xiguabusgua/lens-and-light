#!/bin/bash
# 推送到服务器（触发自动部署）
# 用法: bash push-to-server.sh "commit message"

MSG="${1:-update $(date +%Y-%m-%d_%H:%M)}"

echo ">>> 添加并提交..."
git add -A
git commit -m "$MSG" 2>/dev/null || echo "无新内容"

echo ">>> 推送到 GitHub..."
git push origin main

echo ">>> 推送到服务器（自动部署）..."
git remote add server root@154.9.25.199:/www/wwwroot/lens-and-light 2>/dev/null || true
git push server main

echo ">>> ✅ 完成！服务器已自动部署"