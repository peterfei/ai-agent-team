---
name: softcopyright
description: "智能软件著作权申请材料生成工具。自动分析项目源码，生成符合软著申请要求的软件说明书和源代码文档。支持关键词搜索、智能源码分析、格式化输出和PDF导出。"
license: MIT
---

# SoftCopyright - 智能软件著作权申请材料生成工具

## 概述

当用户需要申请软件著作权时，此 skill 会自动完成以下流程：
1. 读取用户输入，如果是关键词则先搜索相关内容
2. 分析项目源码结构和内容
3. 生成详细的软件说明书（约2000-3000字）
4. 生成符合要求的源代码文档（60页，每页50行）
5. 导出为PDF格式供软著申请使用

## 支持的触发指令

用户可以通过以下方式触发此 skill：
- "帮我生成软著申请材料" - 处理当前目录项目
- "生成软件说明书" - 仅生成软件说明书
- "生成源代码文档" - 仅生成源代码文档
- 任何关键词 - 首先搜索相关内容，然后询问是否生成软著材料

## 工作流程

### 步骤 1: 理解用户意图

首先判断用户输入的类型：

```javascript
// 检查用户输入类型
if (用户输入包含 "软著" || "著作权") {
  生成类型 = "全部材料"
} else if (用户输入包含 "软件说明书") {
  生成类型 = "说明书"
} else if (用户输入包含 "源代码" || "源码") {
  生成类型 = "源代码文档"
} else if (用户输入是关键词) {
  先搜索相关内容
  询问用户是否生成软著材料
}
```

### 步骤 2: 项目路径确认

```javascript
// 默认使用当前目录
let projectPath = process.cwd()

// 询问用户确认路径
await confirmProjectPath(projectPath)
```

### 步骤 3: 使用CLI生成软著材料

推荐使用CLI工具生成软著材料：

```bash
# 方式1: 使用关键词触发index.js（交互式）
cd ~/.claude/skills/softcopyright
node scripts/index.js 软著

# 方式2: 使用cli.js直接生成（推荐）
node scripts/cli.js generate --project <项目路径>

# 方式3: 使用快捷命令（最佳体验）
~/.claude/skills/softcopyright/softcopyright-generate --project . --auto-pdf

# 方式4: 技能系统自动调用
用户输入"帮我生成软著" → 自动执行: softcopyright-generate --project . --auto-pdf
```

该工具会：
- 自动扫描项目源码
- 识别源代码文件类型
- 分析项目结构和技术栈
- 生成HTML格式的软件说明书和源代码文档
- 询问用户是否自动在浏览器中打开并打印为PDF

### 步骤 4: 生成选项

用户可以选择：

1. **生成全部材料**（软件说明书 + 源代码文档）
2. **仅生成软件说明书**
3. **仅生成源代码文档**
4. **仅查看项目统计**

### 步骤 5: 输出位置

**默认输出路径**: `<项目目录>/softcopyright-output/`

生成的文件：
- `软件说明书_<项目名>_<时间戳>.html`
- `源代码文档_<项目名>_<时间戳>.html`

### 步骤 6: 导出PDF

有两种方式将HTML转换为PDF：

**方式1: 自动转换（推荐）**
```bash
# 添加--auto-pdf选项
node scripts/cli.js generate --project <项目路径> --auto-pdf
```
- 自动在浏览器中打开HTML
- 3秒后自动弹出打印对话框
- 选择"保存为PDF"即可

**方式2: 手动转换**
1. 在浏览器中打开生成的HTML文件
2. 按 Cmd+P (macOS) 或 Ctrl+P (Windows/Linux)
3. 在打印设置中：
   - 展开"更多设置"
   - 勾选"页眉和页脚"
   - 选择"保存为PDF"
4. 保存PDF文件

## 工具脚本使用说明

### scanner.js - 源码扫描工具

扫描项目目录并分析结构：

```bash
node ~/.claude/skills/softcopyright/scripts/scanner.js <项目路径>
```

输出项目分析的JSON文件。

### doc-generator.js - 软件说明书生成器

生成详细的软件说明书：

```bash
node ~/.claude/skills/softcopyright/scripts/doc-generator.js \
  --type manual \
  --input <项目分析JSON> \
  --template <模板文件> \
  --output <输出PDF路径>
```

### source-exporter.js - 源代码文档生成器

生成符合软著要求的源代码文档：

```bash
node ~/.claude/skills/softcopyright/scripts/source-exporter.js \
  --input <源码目录> \
  --output <输出PDF路径> \
  --pages 60 \
  --lines-per-page 50
```

## 使用示例

### 示例 1: 完整软著材料生成

**用户**: "帮我生成软著申请材料"

**Claude 执行流程**:

1. 确认项目路径：当前目录
2. 运行源码扫描工具
3. 分析项目结构和技术栈
4. 生成软件说明书
5. 生成源代码文档
6. 导出PDF文件
7. 向用户展示生成结果

### 示例 2: 关键词搜索后生成

**用户**: "React电商系统"

**Claude 执行流程**:

1. 搜索"React电商系统"相关信息
2. 展示搜索结果
3. 询问："是否需要为React电商系统生成软著申请材料？"
4. 用户确认后执行完整生成流程

### 示例 3: 仅生成软件说明书

**用户**: "帮我生成软件说明书"

**Claude 执行流程**:

1. 扫描项目源码
2. 分析项目功能
3. 生成软件说明书
4. 导出PDF文件

## 输出文件规范

### 软件说明书PDF
- 文件名：`软件说明书_项目名称_YYYYMMDD.pdf`
- 字数要求：2000-3000字
- 包含所有必需章节
- 专业排版和格式

### 源代码文档PDF
- 文件名：`源代码文档_项目名称_YYYYMMDD.pdf`
- 页数要求：60页（或处理全部代码）
- 每页行数：不少于50行
- 无注释和无版权信息
- 代码连续性保证

## 软件著作权申请要求

### 源代码文档要求
1. **页数要求**：通常需要20-60页
2. **格式要求**：每页不超过50行代码
3. **注释要求**：需要移除所有注释，只保留纯代码
4. **页眉页脚**：需要包含软件名称和版本号
5. **代码连续性**：需要保证代码的连续性和完整性

### 软件说明书要求
1. **内容详实**：约2000-3000字
2. **结构完整**：包含所有必需章节
3. **重点突出**：突出软件的独创性
4. **专业描述**：使用专业的技术描述

## 技术栈

- **Node.js**: 主要运行环境
- **PDFKit**: PDF文档生成
- **glob**: 文件模式匹配
- **commander**: CLI参数解析
- **chalk**: 终端颜色输出
- **inquirer**: 交互式命令行界面

## 依赖安装

使用 nvm 管理 Node.js 版本：

```bash
# 确保使用合适的 Node 版本
nvm use 18

# 安装依赖
cd ~/.claude/skills/softcopyright
npm install
```

## 最佳实践

1. **项目分析准确**: 确保正确识别项目类型和技术栈
2. **内容详实专业**: 生成专业的技术描述和功能说明
3. **格式规范合规**: 严格按照软著申请要求格式化
4. **用户交互友好**: 提供清晰的进度提示和确认流程
5. **文档完整性**: 确保生成材料的完整性和准确性

## 安全注意事项

1. **源码安全**: 不修改原始源码，只读取和分析
2. **隐私保护**: 不上传源码到外部服务
3. **本地处理**: 所有处理都在本地完成
4. **用户确认**: 重要操作前需要用户确认

## 故障排除

### 扫描失败
```bash
# 检查项目路径
ls -la <项目路径>

# 检查权限
chmod -R 755 <项目路径>
```

### PDF生成失败
```bash
# 检查依赖安装
cd ~/.claude/skills/softcopyright
npm list

# 重新安装依赖
npm install
```

### 内存不足
对于大型项目，可以：
1. 排除不必要的目录（node_modules, .git等）
2. 分批处理源码文件
3. 增加Node.js内存限制

## 开发和扩展

要添加新的文件类型支持，编辑 `scripts/scanner.js`：

```javascript
const SUPPORTED_EXTENSIONS = {
  '.rs': {
    'single_line': '//',
    'multi_line': ['/*', '*/'],
    'language': 'rust'
  },
  '.go': {
    'single_line': '//',
    'multi_line': ['/*', '*/'],
    'language': 'go'
  }
}
```

---

**版本**: 1.0.0
**作者**: peterfei
**许可**: MIT