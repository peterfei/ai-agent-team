---
name: tidymydesktop
description: "智能桌面和目录整理工具。根据用户提示词自动分类、整理文件和应用程序图标，去除重复版本，生成整理报告。支持整理桌面或指定目录。"
license: MIT
---

# TidyMyDesktop - 智能桌面整理工具

## 概述

当用户请求整理桌面或目录时，此 skill 会自动：
1. 分析目录中的文件和应用程序
2. 智能分类并创建文件夹
3. 识别和删除软件的旧版本
4. 搜索未知软件的用途
5. 生成详细的整理报告（Markdown格式）

## 支持的触发指令

用户可以通过以下方式触发此 skill：
- "帮我整理桌面" - 整理 ~/Desktop
- "帮我整理当前目录" - 整理当前工作目录（需要用户确认）
- 任何关键词 - 首先搜索相关内容

## 工作流程

### 步骤 1: 理解用户意图

首先判断用户输入的类型：

```javascript
// 检查是否是整理指令
if (用户输入包含 "整理桌面") {
  目标路径 = ~/Desktop
} else if (用户输入包含 "整理当前目录") {
  // 需要用户确认目录路径
  await askUserToConfirmPath()
} else {
  // 如果是关键词，先搜索相关内容
  await searchKeyword(用户输入)
  return
}
```

### 步骤 2: 扫描和分析目录

使用提供的 Node.js 工具脚本扫描目标目录：

```bash
# 扫描目录并生成文件清单
node ~/.claude/skills/tidymydesktop/scripts/scan.js <目标路径>
```

该脚本会：
- 列出所有文件和应用程序
- 识别文件类型和扩展名
- 检测应用程序版本号
- 生成初始清单

### 步骤 3: 智能分类和整理

执行整理操作时，遵循以下原则：

#### 3.1 文件分类规则

根据文件类型创建分类文件夹：

- **应用程序** (`Applications/`)
  - 开发工具 (`Development/`)
  - 办公软件 (`Office/`)
  - 设计工具 (`Design/`)
  - 通讯工具 (`Communication/`)
  - 娱乐软件 (`Entertainment/`)
  - 系统工具 (`Utilities/`)

- **文档** (`Documents/`)
  - PDF文档 (`PDFs/`)
  - Word文档 (`Word/`)
  - Excel表格 (`Excel/`)
  - 文本文件 (`TextFiles/`)

- **图片** (`Images/`)
  - 照片 (`Photos/`)
  - 截图 (`Screenshots/`)
  - 设计稿 (`Designs/`)

- **视频** (`Videos/`)
- **音频** (`Audio/`)
- **压缩包** (`Archives/`)
- **代码项目** (`CodeProjects/`)
- **未分类** (`Uncategorized/`)

#### 3.2 版本去重规则

对于同一软件的多个版本：

```javascript
// 识别版本号模式
// 例如: "AppName v1.2.3.dmg" 和 "AppName v2.0.0.dmg"
// 保留: 最新版本
// 删除: 旧版本

function identifyVersions(files) {
  // 1. 提取版本号
  // 2. 比较版本
  // 3. 标记要删除的旧版本
}
```

**CRITICAL**: 在删除任何文件前，必须：
1. 向用户展示将被删除的文件列表
2. 等待用户确认
3. 获得明确同意后才执行删除操作

#### 3.3 未知软件处理

当遇到不确定用途的软件时：

```bash
# 使用 WebSearch 搜索软件信息
# 搜索查询格式: "<软件名称> 是什么软件 用途"
```

如果搜索后仍不确定：
- 将其放入 `未分类/` 文件夹
- 在报告中标注为"需要人工审核"

### 步骤 4: 执行整理操作

使用提供的整理脚本：

```bash
# 执行整理操作
node ~/.claude/skills/tidymydesktop/scripts/organize.js \
  --source <目标路径> \
  --plan <整理计划JSON文件> \
  --dry-run  # 首次运行使用 dry-run 模式
```

**重要安全措施**：
1. 首次运行使用 `--dry-run` 模式（仅模拟，不实际移动文件）
2. 向用户展示整理计划
3. 获得用户确认后，再执行实际操作
4. 所有删除操作都需要用户明确确认

### 步骤 5: 生成整理报告

创建详细的 Markdown 报告，包含：

```markdown
# 桌面整理报告

**整理时间**: YYYY-MM-DD HH:MM:SS
**整理路径**: /Users/xxx/Desktop

## 整理概要

- 总文件数: XXX
- 已分类文件: XXX
- 创建的文件夹: XXX
- 删除的重复文件: XXX
- 未分类文件: XXX

## 分类详情

### 应用程序 (XX 个)
- 开发工具 (XX 个)
  - Visual Studio Code
  - IntelliJ IDEA
  - ...

### 文档 (XX 个)
- PDF文档 (XX 个)
- ...

## 版本去重记录

| 软件名称 | 保留版本 | 删除版本 | 状态 |
|---------|---------|---------|------|
| Example App | v2.0.0 | v1.0.0, v1.5.0 | 已删除 |

## 未知软件

| 文件名 | 搜索结果 | 处理方式 |
|-------|---------|---------|
| Unknown.app | 未找到相关信息 | 放入"未分类"文件夹 |

## 建议

- [可选] 进一步整理建议
- [可选] 可能需要手动审核的项目
```

报告保存位置：
- 桌面整理: `~/Desktop/整理报告_YYYYMMDD_HHMMSS.md`
- 目录整理: `<目标路径>/整理报告_YYYYMMDD_HHMMSS.md`

## 工具脚本使用说明

### scan.js - 目录扫描工具

扫描目录并生成文件清单：

```bash
node ~/.claude/skills/tidymydesktop/scripts/scan.js <目标路径>
```

输出 JSON 格式的文件清单。

### organize.js - 整理执行工具

根据整理计划执行文件移动和删除操作：

```bash
# Dry-run 模式（推荐首次使用）
node ~/.claude/skills/tidymydesktop/scripts/organize.js \
  --source <目标路径> \
  --plan <整理计划.json> \
  --dry-run

# 实际执行
node ~/.claude/skills/tidymydesktop/scripts/organize.js \
  --source <目标路径> \
  --plan <整理计划.json>
```

### classify.js - 智能分类工具

使用 AI 辅助分类未知文件：

```bash
node ~/.claude/skills/tidymydesktop/scripts/classify.js \
  --file <文件路径> \
  --search  # 启用网络搜索
```

## 使用示例

### 示例 1: 整理桌面

**用户**: "帮我整理桌面"

**Claude 执行流程**:

1. 识别触发词 "整理桌面"
2. 设置目标路径为 `~/Desktop`
3. 运行扫描工具
4. 生成分类计划
5. 以 dry-run 模式预览整理结果
6. 向用户展示整理计划
7. 等待用户确认
8. 执行实际整理操作
9. 生成并保存整理报告
10. 向用户展示报告摘要

### 示例 2: 整理当前目录

**用户**: "帮我整理当前目录"

**Claude**:

"我将整理当前目录。请确认目标路径：`/Users/xxx/Downloads`

是否继续？(yes/no)"

**用户**: "yes"

**Claude 执行流程**:
（与示例 1 相同的流程）

### 示例 3: 关键词搜索

**用户**: "VS Code"

**Claude 执行流程**:

1. 识别为关键词（非整理指令）
2. 使用 WebSearch 搜索 "VS Code"
3. 返回搜索结果
4. 不执行整理操作

## 安全注意事项

1. **永远不要自动删除文件** - 所有删除操作必须经过用户明确确认
2. **使用 dry-run 模式** - 首次整理时始终使用模拟模式
3. **备份提醒** - 在执行重要操作前提醒用户备份
4. **路径确认** - 整理目录时必须让用户确认路径
5. **版本识别准确性** - 版本号识别可能不准确，标记为"待确认"

## 依赖项

Node.js 包（通过 nvm 管理）：
- `fs-extra` - 文件系统操作
- `glob` - 文件匹配
- `semver` - 版本号比较
- `commander` - 命令行参数解析

安装依赖：

```bash
# 使用 nvm 切换到合适的 Node 版本
nvm use 18

# 安装依赖
cd ~/.claude/skills/tidymydesktop
npm install
```

## 限制和注意事项

1. **macOS 特定功能**：
   - `.app` 应用程序包识别
   - Finder 标签和颜色（暂不支持）

2. **不支持的操作**：
   - 移动系统文件
   - 整理受保护的目录
   - 修改文件内容

3. **性能考虑**：
   - 大型目录（>1000个文件）可能需要较长时间
   - 网络搜索会增加处理时间

## 故障排除

### 脚本执行失败

```bash
# 检查 Node.js 版本
node --version  # 应该 >= 14.0.0

# 检查依赖安装
cd ~/.claude/skills/tidymydesktop
npm list
```

### 权限错误

某些目录可能需要额外权限。如果遇到权限问题：
- 检查目标目录的读写权限
- 避免整理系统目录
- 使用用户目录（如 ~/Desktop, ~/Downloads）

## 开发和扩展

要添加新的文件分类规则，编辑 `scripts/classify.js`：

```javascript
const CATEGORY_RULES = {
  // 添加新的分类规则
  'NewCategory': {
    extensions: ['.ext1', '.ext2'],
    keywords: ['keyword1', 'keyword2'],
    subfolder: 'NewCategory'
  }
}
```

---

**版本**: 1.0.0
**作者**: Claude AI
**许可**: MIT
