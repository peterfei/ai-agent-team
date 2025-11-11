# Claude 插件集成说明

## 📋 概述

本文档说明了如何将 `/Users/mac/Downloads/.claude-plugin` 中的 skill 成功融合到 `ai-agent-team` 项目中，并实现自动加载。

## 🎯 集成目标

- ✅ 将 DrawNote skill 集成到项目
- ✅ 配置自动加载机制
- ✅ 更新项目文档
- ✅ 添加安装/卸载脚本
- ✅ 更新 .gitignore 规则

## 📁 集成内容

### 1. 插件目录结构

```
.claude-plugin/
├── drawnote-skill/          # DrawNote 智能笔记技能
│   ├── scripts/             # Playwright 截图脚本
│   │   └── capture.js
│   ├── styles/              # 风格模板
│   │   └── 彩色手写笔记风格.md
│   ├── SKILL.md            # Skill 详细说明
│   ├── README.md           # 使用指南
│   ├── QUICKSTART.md       # 快速入门
│   ├── 风格使用指南.md      # 风格使用指南
│   ├── 生成信息图提示词.md  # 提示词模板
│   ├── package.json        # 依赖配置
│   └── node_modules/       # 依赖包（已安装）
├── marketplaces.json       # 插件配置文件
├── README.md               # 插件系统说明
├── install.sh              # 安装脚本
└── uninstall.sh            # 卸载脚本
```

### 2. 插件配置

**marketplaces.json**:
```json
{
    "name": "local-drawnote-plugin",
    "owner": {
        "name": "local",
        "email": "local@example.com"
    },
    "metadata": {
        "description": "Local plugin providing DrawNote skill",
        "version": "1.0.0"
    },
    "plugins": [
        {
            "name": "drawnote",
            "description": "Intelligent note and flowchart visualization tool",
            "source": "./",
            "strict": false,
            "skills": [
                "./drawnote-skill"
            ]
        }
    ]
}
```

## 🔧 集成步骤

### 步骤 1: 创建插件目录

```bash
mkdir -p .claude-plugin
```

### 步骤 2: 复制插件文件

```bash
cp -r /Users/mac/Downloads/.claude-plugin/drawnote-skill .claude-plugin/
cp /Users/mac/Downloads/.claude-plugin/marketplaces.json .claude-plugin/
```

### 步骤 3: 安装依赖

```bash
cd .claude-plugin/drawnote-skill
npm install
npm run install-browsers  # 安装 Playwright Chromium
```

### 步骤 4: 更新 .gitignore

添加以下规则到项目根目录的 `.gitignore` 文件：

```gitignore
# DrawNote skill generated files
drawnote_*.html
drawnote_*.png

# Plugin cache and generated files
.claude-plugin/**/node_modules/
.claude-plugin/**/.DS_Store
```

### 步骤 5: 创建文档和脚本

- ✅ `.claude-plugin/README.md` - 插件使用说明
- ✅ `.claude-plugin/install.sh` - 安装脚本
- ✅ `.claude-plugin/uninstall.sh` - 卸载脚本
- ✅ 更新主 `README.md` - 添加插件系统章节

### 步骤 6: 更新安装脚本

修改 `install.sh`，添加 `install_plugins()` 函数，支持自动安装插件。

## 📝 使用方法

### 基本使用

在 Claude Code 中直接使用：

```
请帮我创建一个关于"人工智能发展历程"的信息图
```

### 指定风格

```
请使用彩色手写笔记风格生成"机器学习算法"的信息图
```

### 可用风格

1. **专业商务风格**（默认） - 适合商业报告、数据分析
2. **彩色手写笔记风格** ⭐ 推荐 - 适合学习笔记、读书总结
3. **科技创新风格** - 适合技术文档、产品介绍
4. **自然清新风格** - 适合环保主题、健康生活
5. **现代简约风格** - 适合极简设计、艺术展示

### 生成文件位置

所有生成的文件会保存到当前工作目录：
- HTML 文件：`drawnote_YYYYMMDD_HHMMSS.html`
- PNG 截图：`drawnote_YYYYMMDD_HHMMSS.png`

## 🚀 自动加载机制

### Claude Code 插件系统

Claude Code 会自动检测并加载以下位置的插件：

1. **全局插件目录**: `~/.claude-plugin/`
2. **项目插件目录**: `<project>/.claude-plugin/`

### 加载优先级

项目级插件会覆盖全局插件（如果有同名插件）。

### 验证加载

在 Claude Code 中运行：

```
/skills
```

应该能看到 `drawnote:drawnote-skill` 出现在列表中。

## 🛠️ 维护和管理

### 手动安装

如果自动安装失败，可以手动运行：

```bash
./.claude-plugin/install.sh
```

### 手动卸载

```bash
./.claude-plugin/uninstall.sh
```

### 完全删除

```bash
rm -rf .claude-plugin
```

## 📦 依赖说明

### Node.js 依赖

- **playwright**: ^1.40.0 - 用于浏览器自动化和截图

### 系统依赖

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **Chromium**: 通过 Playwright 自动安装

## 🔍 故障排除

### 问题 1: Skill 未显示

**解决方案**:
1. 检查 `.claude-plugin` 目录是否在项目根目录
2. 验证 `marketplaces.json` 配置是否正确
3. 重启 Claude Code

### 问题 2: Playwright 截图失败

**解决方案**:
```bash
cd .claude-plugin/drawnote-skill
npx playwright install chromium
```

### 问题 3: 依赖安装失败

**解决方案**:
```bash
cd .claude-plugin/drawnote-skill
rm -rf node_modules package-lock.json
npm install
```

## 📚 相关文档

- [插件使用说明](.claude-plugin/README.md)
- [DrawNote Skill 文档](.claude-plugin/drawnote-skill/SKILL.md)
- [风格使用指南](.claude-plugin/drawnote-skill/风格使用指南.md)
- [快速入门](.claude-plugin/drawnote-skill/QUICKSTART.md)

## 🎉 集成完成

插件已成功集成到项目中，现在可以在 Claude Code 中直接使用 DrawNote skill 来创建精美的可视化笔记和流程图！

---

**集成时间**: 2025-11-11
**集成者**: Claude Code Assistant
**插件来源**: `/Users/mac/Downloads/.claude-plugin/`
**目标项目**: `ai-agent-team`
