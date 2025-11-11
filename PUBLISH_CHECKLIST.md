# AI Agent Team 1.0.1 发布检查清单

## ✅ 版本更新

- [x] 更新 `package.json` 版本号到 1.0.1
- [x] 更新 `package.json` 描述信息（添加插件说明）
- [x] 更新 `package.json` files 列表（添加 .claude-plugin/）
- [x] 更新 `README.md` 版本徽章到 1.0.1
- [x] 更新 `install.sh` VERSION 变量到 1.0.1
- [x] 创建/更新 `CHANGELOG.md` 添加 1.0.1 版本内容

## ✅ 文档更新

- [x] 创建 `.claude-plugin/README.md` - 插件系统说明
- [x] 创建 `PLUGIN_INTEGRATION.md` - 插件集成文档
- [x] 更新主 `README.md` - 添加插件系统章节
- [x] 创建 `RELEASE_NOTES_1.0.1.md` - 版本发布说明
- [x] 创建 `PUBLISH_CHECKLIST.md` - 本检查清单

## ✅ 代码和配置

- [x] 集成 `.claude-plugin/` 目录结构
- [x] 复制 DrawNote Skill 所有文件
- [x] 创建插件管理脚本（install.sh, uninstall.sh）
- [x] 更新 `.gitignore` 添加插件生成文件规则
- [x] 更新 `install.sh` 支持插件自动安装
- [x] 确保所有脚本可执行权限正确

## ✅ 依赖和构建

- [x] 安装 DrawNote Skill 依赖（playwright）
- [x] 安装 Playwright 浏览器（chromium）
- [x] 验证 package.json 的 files 列表包含所有必要文件
- [x] 验证 engines 字段（Node.js >= 16.0.0）

## ✅ 打包测试

- [x] 执行 `npm pack --dry-run` 检查打包文件列表
- [x] 执行 `npm pack` 生成实际包文件
- [x] 验证包文件大小合理（约 550 KB）
- [x] 验证包文件名正确（ai-agent-team-1.0.1.tgz）

## ✅ 安装测试

- [x] 在临时目录测试本地安装
- [x] 验证所有目录正确安装（.claude/, .claude-plugin/, bin/, scripts/, docs/）
- [x] 验证版本号正确（1.0.1）
- [x] 验证文件结构完整
- [x] 清理测试环境

## ✅ 功能验证

### 智能体系统
- [ ] 测试产品经理智能体（/pm）
- [ ] 测试前端开发智能体（/fe）
- [ ] 测试后端开发智能体（/be）
- [ ] 测试测试工程师智能体（/qa）
- [ ] 测试运维工程师智能体（/ops）
- [ ] 测试技术负责人智能体（/tl）

### 插件系统
- [ ] 验证插件自动加载
- [ ] 测试 DrawNote Skill 基本功能
- [ ] 测试不同风格的信息图生成
- [ ] 验证文件生成路径正确

### CLI 工具
- [ ] 测试 CLI 工具基本调用
- [ ] 测试中英文名称映射
- [ ] 测试错误处理

## 📋 发布前准备

### Git 提交
- [ ] 提交所有更改
  ```bash
  git add .
  git commit -m "🚀 Release v1.0.1: 集成插件系统和DrawNote Skill"
  ```

- [ ] 创建版本标签
  ```bash
  git tag -a v1.0.1 -m "Release version 1.0.1"
  ```

- [ ] 推送到远程仓库
  ```bash
  git push origin main
  git push origin v1.0.1
  ```

### npm 发布
- [ ] 登录 npm（如未登录）
  ```bash
  npm login
  ```

- [ ] 发布到 npm
  ```bash
  npm publish
  ```

- [ ] 验证 npm 上的版本
  ```bash
  npm view ai-agent-team version
  ```

### GitHub Release
- [ ] 在 GitHub 上创建新的 Release
  - Tag: v1.0.1
  - Title: AI Agent Team v1.0.1 - 插件系统集成
  - 描述: 使用 RELEASE_NOTES_1.0.1.md 的内容
  - 附件: ai-agent-team-1.0.1.tgz

## 📢 发布后推广

### 更新文档网站
- [ ] 更新在线文档（如有）
- [ ] 更新示例和教程

### 社区通知
- [ ] 在 GitHub Discussions 发布公告
- [ ] 在 npm 包页面更新 README
- [ ] 社交媒体分享（如适用）

### 用户通知
- [ ] 邮件通知订阅用户（如有）
- [ ] 更新项目官网（如有）
- [ ] 在相关社区分享更新

## 🐛 发布后监控

### 第一周
- [ ] 监控 GitHub Issues 是否有新问题
- [ ] 监控 npm 下载量
- [ ] 收集用户反馈
- [ ] 快速修复严重 bug

### 持续监控
- [ ] 每周检查 Issues
- [ ] 每月统计使用数据
- [ ] 规划下一个版本

## 📝 备注

### 包信息
- **包名**: ai-agent-team
- **版本**: 1.0.1
- **包大小**: 550 KB (压缩) / 789.3 KB (解压)
- **文件总数**: 50
- **发布日期**: 2025-11-11

### 重要文件位置
- 包文件: `./ai-agent-team-1.0.1.tgz`
- 发布说明: `./RELEASE_NOTES_1.0.1.md`
- 更新日志: `./CHANGELOG.md`
- 检查清单: `./PUBLISH_CHECKLIST.md` (本文件)

### 紧急回滚计划
如果发布后发现严重问题，执行以下步骤：

1. 从 npm 撤回版本（如果可能）
   ```bash
   npm unpublish ai-agent-team@1.0.1
   ```

2. 回滚 Git 标签
   ```bash
   git tag -d v1.0.1
   git push origin :refs/tags/v1.0.1
   ```

3. 发布补丁版本修复问题
   ```bash
   # 修复问题后
   npm version patch
   npm publish
   ```

## ✅ 最终确认

在执行 `npm publish` 之前，请确认：

- [ ] 所有测试通过
- [ ] 文档完整且准确
- [ ] 版本号正确
- [ ] CHANGELOG 已更新
- [ ] Git 提交和标签已创建
- [ ] 已阅读并理解 npm 发布策略
- [ ] 准备好处理发布后的问题

---

**准备发布人**: Peter Fei
**检查日期**: 2025-11-11
**状态**: ✅ 准备就绪

🚀 **准备发布 AI Agent Team v1.0.1!**
