# SoftCopyright 使用示例

本文档提供了 SoftCopyright 工具的详细使用示例和最佳实践。

## 📚 目录

1. [基础使用](#基础使用)
2. [高级用法](#高级用法)
3. [配置自定义](#配置自定义)
4. [实际案例](#实际案例)
5. [常见问题](#常见问题)

## 基础使用

### 1. 交互式向导（推荐新用户）

```bash
# 进入项目目录
cd ~/.claude/skills/softcopyright

# 启动交互式向导
node scripts/index.js interactive
```

交互式向导会：
- 询问项目路径
- 分析项目结构
- 显示项目信息供确认
- 选择生成内容类型
- 指定输出目录
- 逐步生成所需材料

### 2. 快速生成完整材料

```bash
# 为当前目录项目生成完整软著材料
node scripts/index.js generate

# 为指定项目生成材料
node scripts/index.js generate --path /path/to/your/project

# 指定输出目录
node scripts/index.js generate --output ~/Downloads/copyright-docs
```

### 3. 分别生成不同材料

```bash
# 仅生成软件说明书
node scripts/index.js generate --type manual

# 仅生成源代码文档
node scripts/index.js generate --type source

# 生成说明书到指定目录
node scripts/index.js generate --type manual --output ~/Desktop
```

### 4. 项目扫描和分析

```bash
# 扫描当前项目
node scripts/index.js scan .

# 扫描指定项目
node scripts/index.js scan /path/to/project

# 查看帮助
node scripts/index.js scan --help
```

## 高级用法

### 1. 批量处理多个项目

创建批量处理脚本 `batch-process.js`：

```javascript
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projects = [
  '/path/to/project1',
  '/path/to/project2',
  '/path/to/project3'
];

const outputDir = '/path/to/output';

projects.forEach(projectPath => {
  console.log(`处理项目: ${projectPath}`);

  try {
    execSync(`node scripts/index.js generate --path "${projectPath}" --output "${outputDir}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    console.log(`✅ 项目处理完成: ${projectPath}`);
  } catch (error) {
    console.error(`❌ 项目处理失败: ${projectPath}`, error.message);
  }
});
```

### 2. 自定义配置文件

在项目根目录创建 `softcopyright.config.js`：

```javascript
module.exports = {
  // 忽略的目录
  ignoreDirs: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next'
  ],

  // 忽略的文件模式
  ignoreFiles: [
    '*.min.js',
    '*.min.css',
    '*.map',
    '.DS_Store',
    'Thumbs.db'
  ],

  // 源代码文档配置
  sourceCodeConfig: {
    maxPages: 60,
    linesPerPage: 50,
    fontSize: 8,
    fontFamily: 'Courier',
    headerFontSize: 10,
    footerFontSize: 8
  },

  // 软件说明书配置
  manualConfig: {
    wordCount: 2500,
    includeScreenshots: true,
    includeDiagrams: true,
    customSections: [
      '技术创新点',
      '市场应用前景'
    ]
  },

  // PDF 生成配置
  pdfConfig: {
    size: 'A4',
    margins: {
      top: 50,
      bottom: 50,
      left: 40,
      right: 40
    }
  }
};
```

### 3. 编程方式调用

```javascript
const scanner = require('./scripts/scanner');
const docGenerator = require('./scripts/doc-generator');
const sourceExporter = require('./scripts/source-exporter');

async function generateMaterials(projectPath, outputPath) {
  try {
    // 扫描项目
    const projectInfo = await scanner.scanProject(projectPath);

    console.log('项目扫描完成:', projectInfo.name);

    // 生成软件说明书
    const manualPath = await docGenerator.generateManual(projectInfo, outputPath);
    console.log('软件说明书生成完成:', manualPath);

    // 生成源代码文档
    const sourcePath = await sourceExporter.exportSourceCode(projectInfo, outputPath);
    console.log('源代码文档生成完成:', sourcePath);

    return { manualPath, sourcePath };
  } catch (error) {
    console.error('生成失败:', error);
    throw error;
  }
}

// 使用示例
generateMaterials('/path/to/project', '/path/to/output')
  .then(result => {
    console.log('所有材料生成完成:', result);
  })
  .catch(error => {
    console.error('处理失败:', error);
  });
```

## 实际案例

### 案例1：React Web应用项目

```bash
# 假设有一个React项目
cd ~/projects/my-react-app

# 生成软著材料
node ~/.claude/skills/softcopyright/scripts/index.js generate --output ~/Desktop/copyright-docs

# 预期输出：
# - 软件说明书_my-react-app_20241124_143022.pdf
# - 源代码文档_my-react-app_20241124_143022.pdf
```

**分析结果示例：**
```
📊 扫描结果:
项目名称: my-react-app
源代码文件: 45 个
总代码行数: 8,234 行
主要语言: javascript, jsx, css

📁 文件类型统计:
  .js: 25 个文件
  .jsx: 15 个文件
  .css: 5 个文件
```

### 案例2：Python数据分析项目

```bash
# Python项目
cd ~/projects/data-analysis

# 仅生成源代码文档（因为代码量较大）
node ~/.claude/skills/softcopyright/scripts/index.js generate --type source --max-pages 80
```

### 案例3：企业Java项目

```bash
# 企业级Java项目
cd ~/projects/enterprise-system

# 指定更大的页数限制
node ~/.claude/skills/softcopyright/scripts/index.js generate \
  --config.sourceCodeConfig.maxPages=100 \
  --output ~/Desktop/enterprise-copyright
```

## 配置自定义

### 1. 扩展支持的文件类型

编辑 `scripts/scanner.js`：

```javascript
// 在 SUPPORTED_EXTENSIONS 中添加新的文件类型
const SUPPORTED_EXTENSIONS = {
  // 现有类型...

  '.dart': {
    single_line: '//',
    multi_line: [/\/\*/, /\*/],
    language: 'dart',
    priority: 2
  },

  '.lua': {
    single_line: '--',
    multi_line: [/--\[\[/, /\]\]/],
    language: 'lua',
    priority: 3
  }
};
```

### 2. 自定义说明书模板

1. 复制现有模板：
```bash
cp templates/software-manual.md templates/custom-manual.md
```

2. 编辑模板文件，添加自定义章节和格式

3. 在 `scripts/doc-generator.js` 中使用自定义模板

### 3. 自定义PDF样式

在 `scripts/doc-generator.js` 中修改PDF样式：

```javascript
// 自定义颜色主题
const colors = {
  primary: '#2C3E50',
  secondary: '#3498DB',
  accent: '#E74C3C',
  background: '#ECF0F1'
};

// 自定义字体
doc.font('Helvetica-Bold');
doc.fontSize(16);
doc.fillColor(colors.primary);
```

## 常见问题

### Q1: 如何处理大型项目？

**A:** 对于代码量超过60页限制的大型项目：

1. **优先级排序**：工具会自动按文件重要性和行数排序
2. **增加页数**：使用配置文件增加maxPages
3. **选择性处理**：只包含核心模块和重要文件
4. **分批处理**：将项目分成多个子项目分别处理

```javascript
// 配置示例
module.exports = {
  sourceCodeConfig: {
    maxPages: 100,  // 增加到100页
    linesPerPage: 60  // 增加每页行数
  }
};
```

### Q2: 如何处理特殊字符和编码？

**A:** 工具默认使用UTF-8编码处理文件：

```javascript
// 在 utils.js 中添加编码检测和转换
async function readFileWithEncoding(filePath) {
  const buffer = await fs.readFile(filePath);
  const encoding = detectEncoding(buffer);
  return buffer.toString(encoding);
}
```

### Q3: 如何自定义项目类型识别？

**A:** 在 `scanner.js` 中的 `analyzeProjectFeatures` 函数中添加自定义逻辑：

```javascript
function analyzeProjectFeatures(files, projectPath) {
  // 现有逻辑...

  // 自定义检测
  const hasDockerFile = files.some(f => f.path.includes('Dockerfile'));
  const hasK8sFiles = files.some(f => f.path.includes('k8s') || f.path.includes('kubernetes'));

  if (hasDockerFile && hasK8sFiles) {
    features.type = 'containerized';
    features.deployment = 'kubernetes';
  }

  return features;
}
```

### Q4: 如何生成多语言版本的说明书？

**A:** 创建多语言模板：

```javascript
// 根据语言选择模板
function getTemplateByLanguage(language) {
  const templates = {
    'zh': 'templates/software-manual-zh.md',
    'en': 'templates/software-manual-en.md',
    'ja': 'templates/software-manual-ja.md'
  };

  return templates[language] || templates['zh'];
}
```

## 最佳实践

1. **项目组织**：确保项目结构清晰，避免包含不必要的文件
2. **代码规范**：保持良好的代码注释和文档
3. **版本控制**：在生成文档前确保代码版本稳定
4. **备份重要**：生成前备份重要文件
5. **测试验证**：生成后检查PDF文档的完整性

---

**Author**: peterfei
**Last Updated**: 2024-11-24
**Version**: 1.0.0