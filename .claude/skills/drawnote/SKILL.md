---
name: drawnote-skill
description: "智能笔记与流程图绘制工具（优化版-无权限读取）。根据用户提供的内容，自动生成精美的可视化笔记和流程图，支持多种风格(手写笔记、思维导图、流程图等)，并导出为图片。使用内置模板，无需读取文件权限。适用于：(1) 学习笔记可视化，(2) 知识梳理与总结，(3) 流程图绘制，(4) 概念解释图表"
---

# drawnote-skill - 智能笔记与流程图绘制工具

## 🚀 优化说明

**版本 2.0 - 无权限读取优化**：
- ✅ 移除了运行时文件读取，不再请求读取权限
- ✅ 所有提示词模板已内置到 skill 中
- ✅ 风格模板已内置，无需外部文件依赖
- ✅ 优化 Playwright 配置，消除文件创建确认提示
- ✅ 自动接受所有弹窗对话框，提升用户体验
- ✅ 保持完整功能，用户体验更流畅

## 概述

当用户需要创建可视化笔记或流程图时，此 skill 会自动完成以下流程：
1. 分析用户输入（如果是关键词则搜索相关内容）
2. 使用内置提示词模板（无文件读取）
3. 生成 HTML 格式的笔记/流程图
4. 使用 Playwright 截图保存到**用户当前工作目录**

## 工作流程

**⚠️ 重要：文件保存路径**
- 所有生成的文件（HTML 和 PNG）必须保存到用户的当前工作目录
- 在开始工作前，先获取当前工作目录（使用 `pwd` 命令或检查环境变量）
- 不要将文件保存到 skill 插件的目录下

### 1. 内容准备阶段

**分析用户输入**：
- 如果用户提供了详细内容，直接使用
- 如果用户只提供了关键词或主题，使用 WebSearch 工具搜索相关信息
- 整合和提取关键信息点

**内容准备示例**：
```bash
# 用户输入："人工智能发展历程"
# -> 需要搜索 AI 发展历程的关键事件、时间线、重要人物等
# -> 整理成结构化的内容供信息图使用
```

### 2. 使用内置提示词模板

**OPTIMIZED**: 使用内置提示词模板，避免运行时读取文件权限请求。

提示词模板已内置，包含：
- 信息图的设计原则
- HTML 结构规范
- 样式指南
- 布局要求
- 多种风格模板（彩色手写笔记、专业商务、科技创新等）

### 3. 生成 HTML 信息图

根据提示词模板生成 HTML 文件：
- 使用现代 CSS 布局（Flexbox/Grid）
- 确保响应式设计
- 应用美观的配色方案
- 包含适当的视觉层次

**HTML 文件保存位置**：`当前工作目录/drawnote_[timestamp].html`

**重要说明**：
- ⚠️ 文件必须保存到用户的当前工作目录，而非 skill 插件目录
- 先执行 `pwd` 命令获取当前工作目录路径
- 文件命名格式：`drawnote_YYYYMMDD_HHMMSS.html` 和 `.png`
- 示例：如果当前在 `/Users/mac/Downloads`，则保存为 `/Users/mac/Downloads/drawnote_20231110_143022.html`

**设计要求**：
- 清晰的视觉层次
- 适当的留白和间距
- 统一的配色方案
- 易读的字体和字号
- 数据可视化元素（图表、图标等）

### 4. Playwright 截图

使用 Playwright 将 HTML 文件渲染并截图：

```bash
# 注意：使用当前工作目录的绝对路径
node ~/.claude/plugins/.../drawnote-skill/scripts/capture.js drawnote_[timestamp].html drawnote_[timestamp].png
```

**截图参数**：
- 分辨率：1920x1080 或根据内容自适应
- 格式：PNG（高质量）
- 确保完整渲染后再截图

## 🎨 风格选择

drawnote-skill 提供多种信息图风格，详见 `风格使用指南.md`

### 可用风格

1. **专业商务风格** (默认) - 适合商业报告、数据分析
2. **彩色手写笔记风格** ⭐ 推荐 - 适合学习笔记、读书总结
3. **科技创新风格** - 适合技术文档、产品介绍
4. **自然清新风格** - 适合环保主题、健康生活
5. **现代简约风格** - 适合极简设计、艺术展示

### 如何指定风格

```bash
# 方式1：直接指定风格
"请使用彩色手写笔记风格生成XXX的信息图"

# 方式2：描述风格特征
"请生成一个学习笔记风格的信息图，需要多种颜色标注和荧光笔高亮"

# 方式3：引用风格模板
"请参考 styles/彩色手写笔记风格.md 模板生成信息图"
```

**详细说明**：风格模板已内置到 skill 中，无需额外读取文件

---

## 使用示例

### 示例 1: 关键词输入
```
用户: 请帮我创建一个关于"量子计算"的信息图
AI 工作流程:
1. 获取当前工作目录 (如 ~/Downloads)
2. 搜索量子计算的相关信息
3. 提取关键概念、应用领域、发展历程
4. 使用内置提示词模板（无需文件读取）
5. 生成 HTML 文件 → ~/Downloads/drawnote_20231110_143022.html
6. 使用 Playwright 截图 → ~/Downloads/drawnote_20231110_143022.png
```

### 示例 2: 详细内容输入
```
用户在 ~/projects/myapp 目录下: 请用以下内容创建信息图：
- 标题：敏捷开发方法论
- 核心价值观：个体和互动、工作的软件、客户合作、响应变化
- 实践方法：Scrum、Kanban、XP
AI 工作流程:
1. 确认当前工作目录为 ~/projects/myapp
2. 分析提供的内容结构
3. 使用内置提示词模板（无需文件读取）
4. 生成 HTML 信息图 → ~/projects/myapp/drawnote_20231110_143530.html
5. 截图保存 → ~/projects/myapp/drawnote_20231110_143530.png
```

## 技术栈

- **HTML/CSS**: 信息图布局和样式
- **Node.js**: 脚本执行环境
- **Playwright**: 浏览器自动化和截图
- **WebSearch**: 内容搜索（当需要时）

## 脚本文件

### capture.js
位置：`scripts/capture.js`
功能：使用 Playwright 打开 HTML 文件并截图

参数：
- 输入：HTML 文件路径
- 输出：PNG 图片路径

## 输出文件

**所有生成的文件都保存在用户的当前工作目录下：**
- HTML 文件：`drawnote_[timestamp].html`
- PNG 截图：`drawnote_[timestamp].png`

**示例**：
- 如果用户在 `~/Downloads` 工作，文件会保存到 `~/Downloads/drawnote_20231110_143022.html`
- 如果用户在项目目录 `~/projects/myapp`，文件会保存到该目录下

## 质量检查

生成信息图后，应该检查：
- 内容是否完整准确
- 布局是否合理美观
- 文字是否清晰可读
- 配色是否协调
- 视觉层次是否清晰

如果需要调整，可以：
1. 修改 HTML 文件
2. 重新截图
3. 比较前后效果

## 依赖安装

如果需要安装 Node.js 相关包，使用 nvm 管理：

```bash
# 确保使用正确的 Node 版本
nvm use 18  # 或其他合适的版本

# 安装 Playwright
npm install playwright

# 如果需要其他依赖
npm install [package-name]
```

## 最佳实践

1. **内容优先**: 在生成视觉效果之前，确保内容清晰、准确、结构化
2. **简洁设计**: 避免过度装饰，保持信息图的专业性和可读性
3. **数据可视化**: 适当使用图表、图标等视觉元素辅助理解
4. **一致性**: 保持字体、配色、间距等设计元素的一致性
5. **可访问性**: 确保足够的对比度和字号，便于阅读

## 内置提示词模板

### 🎨 风格选择

drawnote-skill 提供多种信息图风格，可根据内容类型和使用场景选择：

#### 1. 彩色手写笔记风格 ⭐ 推荐

**适用场景**：学习笔记、读书总结、知识梳理

**设计特点**：
- 🎨 6种颜色笔标注（红、蓝、绿、橙、紫、粉）
- 🖍️ 5种荧光笔高亮效果
- ✏️ 手写风格字体
- 📓 笔记本横线背景
- 📌 彩色便签纸效果

**配色方案**：
```css
/* 彩色手写笔记风格配色 */
--red-color: #FF4757;      /* 红色笔 */
--blue-color: #3742FA;     /* 蓝色笔 */
--green-color: #26DE81;    /* 绿色笔 */
--orange-color: #FFA502;   /* 橙色笔 */
--purple-color: #5F27CD;   /* 紫色笔 */
--pink-color: #FF6B9D;     /* 粉色笔 */
--yellow-highlight: #FFF3CD; /* 黄色荧光笔 */
--green-highlight: #D4EDDA;  /* 绿色荧光笔 */
--blue-highlight: #D1ECF1;   /* 蓝色荧光笔 */
--pink-highlight: #F8D7DA;   /* 粉色荧光笔 */
--purple-highlight: #E2D9F3; /* 紫色荧光笔 */
```

#### 2. 专业商务风格

**适用场景**：商业报告、数据分析、专业文档

**配色方案**：
```css
/* 专业商务风格配色 */
--primary-color: #2C3E50;    /* 深蓝灰 */
--secondary-color: #3498DB;  /* 亮蓝 */
--accent-color: #E74C3C;     /* 红色 */
--background-color: #ECF0F1; /* 浅灰 */
```

#### 3. 科技创新风格

**适用场景**：技术文档、产品介绍、创新方案

**配色方案**：
```css
/* 科技创新风格配色 */
--primary-color: #1A1A2E;    /* 深蓝黑 */
--secondary-color: #16213E;  /* 深蓝 */
--accent-color: #0F3460;     /* 中蓝 */
--highlight-color: #E94560;  /* 粉红 */
```

### HTML 基础结构模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>信息图标题</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            padding: 40px;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 60px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 50px;
            border-bottom: 3px solid;
            padding-bottom: 30px;
        }

        .header h1 {
            font-size: 48px;
            margin-bottom: 15px;
            font-weight: 700;
        }

        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }

        .card {
            background: #F8F9FA;
            border-radius: 15px;
            padding: 30px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .timeline {
            position: relative;
            padding: 30px 0;
        }

        .timeline-item {
            display: flex;
            margin-bottom: 30px;
            position: relative;
        }

        .timeline-marker {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            flex-shrink: 0;
            margin-right: 20px;
        }

        .timeline-content {
            flex: 1;
            background: #F8F9FA;
            padding: 20px;
            border-radius: 10px;
        }

        .highlight-red { background-color: #FFE5E5; }
        .highlight-blue { background-color: #E5F2FF; }
        .highlight-green { background-color: #E5FFE5; }
        .highlight-yellow { background-color: #FFF9E5; }
        .highlight-orange { background-color: #FFEFD5; }
        .highlight-purple { background-color: #F5E5FF; }

        .note-paper {
            background: linear-gradient(to bottom, #ffffff 1.8em, #f0f0f0 1.9em);
            background-size: 100% 2em;
            position: relative;
        }

        .sticky-note {
            background: #FFF3CD;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
            transform: rotate(-1deg);
            margin: 10px 0;
        }

        .handwritten {
            font-family: 'Comic Sans MS', 'Marker Felt', cursive;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 内容区域 -->
    </div>
</body>
</html>
```

### 常用图标符号

**数据/统计**：📊 📈 📉 💹 📋 📝 📄 📃
**技术/工具**：🔧 ⚙️ 🔨 💻 🖥️ 📱 ⌨️ 🖱️
**创意/想法**：💡 🎨 ✨ 🌟 🎭 🎪 🎯 🎲
**目标/成就**：🎯 🏆 ⭐ ✓ ✅ ✔️ 🎖️ 🏅
**时间/日程**：⏰ 📅 ⏳ 🕐 🕑 🕒 🗓️ ⌛
**人物/团队**：👤 👥 👨‍💼 👩‍💼 👨‍👩‍👦‍👦 👨‍🏫 👩‍🏫 👨‍⚕️
**位置/地点**：📍 🌍 🏢 🏠 🏫 🏥 🏦 🏪
**警告/注意**：⚠️ ❗ ⚡ 🔔 🚨 ❌ ⭕ 📢

## 故障排除

### Playwright 安装问题
```bash
# 安装浏览器
npx playwright install chromium
```

### 截图不完整
- 增加等待时间，确保页面完全渲染
- 检查 HTML 中是否有异步加载的内容
- 调整视口大小

### 样式未生效
- 检查 CSS 语法
- 确保外部资源（字体、图标等）正确加载
- 使用浏览器开发者工具调试

### 文件创建确认提示
**已优化**：现在 drawnote-skill 会自动处理所有文件创建，不再出现确认提示：
- ✅ Playwright 配置优化，自动接受对话框
- ✅ 禁用浏览器弹窗和确认
- ✅ 静默模式运行，提升用户体验

如果仍然遇到确认提示，请检查：
1. 系统文件权限设置
2. 浏览器安全策略
3. 防病毒软件是否拦截
