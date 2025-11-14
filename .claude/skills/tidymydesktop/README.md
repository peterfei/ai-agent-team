# TidyMyDesktop - Claude Skill

智能桌面和目录整理工具，让文件管理变得简单高效。

## 平台支持

✅ **Windows** | ✅ **macOS** | ✅ **Linux**

- Windows 10/11 (使用 .bat 批处理文件)
- macOS 10.14+ (使用 .sh shell 脚本)
- Linux (各种发行版，使用 .sh shell 脚本)

## 测试状态

✅ **所有测试通过** | 📊 [查看完整测试报告](./TEST_REPORT.md)

- 测试用例: 10/10 通过 (100%)
- 功能覆盖率: 100%
- 推荐状态: ✅ 生产环境可用

## 功能特点

- **智能分类**: 自动识别文件类型并创建合适的分类文件夹
- **版本管理**: 检测并删除软件的旧版本，仅保留最新版本
- **搜索增强**: 对未知软件进行网络搜索，确定其用途和分类
- **安全可靠**: 使用 dry-run 模式预览，所有删除操作需要用户确认
- **详细报告**: 生成完整的 Markdown 格式整理报告

## 安装

### 前置要求

- **Node.js >= 14.0.0** (必需)
- nvm (可选，推荐用于 Node 版本管理)

### 安装步骤

```bash
# 1. 确保 skill 已经在正确位置
cd ~/.claude/skills/tidymydesktop

# 2. 安装依赖
npm install

# 3. (可选) 如果使用 nvm，切换到 Node 18
nvm use 18  # 仅在安装了 nvm 时需要
```

**注意**:
- 如果没有安装 nvm，脚本会自动使用系统默认的 Node.js
- 推荐使用 Node.js 18 或更高版本以获得最佳性能

## 使用方法

### 在 Claude 中使用

这个 skill 会在用户提出以下请求时自动激活：

1. "帮我整理桌面"
2. "帮我整理当前目录"
3. 搜索关键词（会先进行搜索）

### 命令行使用

你也可以直接使用命令行工具：

#### 方式 1: 使用快捷命令（推荐）

<details>
<summary><b>macOS / Linux</b></summary>

```bash
# 扫描目录
~/.claude/skills/tidymydesktop/tidy-scan ~/Desktop

# 整理文件（dry-run）
~/.claude/skills/tidymydesktop/tidy-organize --source ~/Desktop --dry-run

# 实际整理
~/.claude/skills/tidymydesktop/tidy-organize --source ~/Desktop

# 分类单个文件
~/.claude/skills/tidymydesktop/tidy-classify --file ~/Desktop/app.dmg
```

</details>

<details>
<summary><b>Windows</b></summary>

```cmd
REM 扫描目录
%USERPROFILE%\.claude\skills\tidymydesktop\tidy-scan.bat %USERPROFILE%\Desktop

REM 整理文件（dry-run）
%USERPROFILE%\.claude\skills\tidymydesktop\tidy-organize.bat --source %USERPROFILE%\Desktop --dry-run

REM 实际整理
%USERPROFILE%\.claude\skills\tidymydesktop\tidy-organize.bat --source %USERPROFILE%\Desktop

REM 分类单个文件
%USERPROFILE%\.claude\skills\tidymydesktop\tidy-classify.bat --file %USERPROFILE%\Desktop\app.exe
```

</details>

**优点**: 自动处理 nvm，无需手动切换 Node 版本

#### 方式 2: 跨平台 Node.js 脚本（推荐跨平台开发）

```bash
# 适用于所有平台
cd ~/.claude/skills/tidymydesktop  # Windows: cd %USERPROFILE%\.claude\skills\tidymydesktop

# 扫描
node scripts/run.js scripts/scan.js ~/Desktop

# 整理（dry-run）
node scripts/run.js scripts/organize.js --source ~/Desktop --dry-run

# 实际整理
node scripts/run.js scripts/organize.js --source ~/Desktop
```

#### 方式 3: 平台特定脚本

<details>
<summary><b>macOS / Linux</b></summary>

```bash
cd ~/.claude/skills/tidymydesktop
./scripts/run.sh scripts/scan.js ~/Desktop
./scripts/run.sh scripts/organize.js --source ~/Desktop --dry-run
```

</details>

<details>
<summary><b>Windows</b></summary>

```cmd
cd /d %USERPROFILE%\.claude\skills\tidymydesktop
scripts\run.bat scripts\scan.js %USERPROFILE%\Desktop
scripts\run.bat scripts\organize.js --source %USERPROFILE%\Desktop --dry-run
```

</details>

# 使用预先生成的计划
node scripts/organize.js --source ~/Desktop --plan organize-plan.json
```

#### 智能分类

```bash
# 分类单个文件
node scripts/classify.js --file ~/Desktop/unknown.app --search

# 批量分类目录
node scripts/classify.js --directory ~/Desktop --search --output classify-result.json
```

## 工作流程

### 整理桌面完整流程

```
用户: "帮我整理桌面"
   ↓
1. 扫描 ~/Desktop
   ↓
2. 分析文件类型和版本
   ↓
3. 生成整理计划
   ↓
4. Dry-run 模式预览
   ↓
5. 用户确认
   ↓
6. 执行整理
   ↓
7. 生成报告
```

### 文件分类规则

#### 应用程序 (Applications/)
- 开发工具 (Development/)
- 办公软件 (Office/)
- 设计工具 (Design/)
- 通讯工具 (Communication/)
- 娱乐软件 (Entertainment/)
- 系统工具 (Utilities/)

#### 文档 (Documents/)
- PDF文档 (PDFs/)
- Word文档 (Word/)
- Excel表格 (Excel/)
- PowerPoint (PowerPoint/)
- 文本文件 (TextFiles/)

#### 图片 (Images/)
- 照片 (Photos/)
- 截图 (Screenshots/)
- 设计稿 (Designs/)

#### 其他
- 视频 (Videos/)
- 音频 (Audio/)
- 压缩包 (Archives/)
- 代码项目 (CodeProjects/)
- 未分类 (Uncategorized/)

## 配置

### 自定义分类规则

编辑 `scripts/organize.js` 中的 `CATEGORY_RULES`：

```javascript
const CATEGORY_RULES = {
  'MyCustomCategory': {
    extensions: ['.custom', '.ext'],
    subcategories: {
      'SubCategory': ['keyword1', 'keyword2']
    }
  }
}
```

### 扩展软件数据库

编辑 `scripts/classify.js` 中的 `SOFTWARE_DATABASE`：

```javascript
const SOFTWARE_DATABASE = {
  'MyCategory': [
    'software1', 'software2', 'keyword3'
  ]
}
```

## 示例输出

### 扫描报告

```
=== 扫描报告 ===

目录: /Users/username/Desktop
总文件数: 127
总大小: 2.45 GB

文件类型分布:
  application: 45 个文件
  document: 32 个文件
  image: 28 个文件
  video: 12 个文件
  other: 10 个文件

检测到的版本:
  Visual Studio Code:
    - Visual Studio Code v1.85.0.dmg (v1.85.0)
    - Visual Studio Code v1.84.2.dmg (v1.84.2)
```

### 整理报告

```markdown
# 桌面整理报告

**整理时间**: 2024-01-15 14:30:00
**整理路径**: /Users/username/Desktop

## 整理概要

- 总文件数: 127
- 已移动文件: 115
- 已删除文件: 2
- 保留文件: 10

## 分类详情

### Applications/Development (15 个)
- Visual Studio Code.app
- IntelliJ IDEA.app
- Docker Desktop.app
...

## 版本去重记录

| 文件名 | 原因 |
|-------|------|
| Visual Studio Code v1.84.2.dmg | 旧版本 (1.84.2), 保留版本: 1.85.0 |
```

## 安全特性

1. **Dry-run 模式**: 首次运行默认使用模拟模式
2. **用户确认**: 所有删除操作必须经过用户明确确认
3. **备份提醒**: 在执行重要操作前提醒用户备份
4. **路径验证**: 整理目录时必须让用户确认路径
5. **错误处理**: 完善的错误处理和回滚机制

## 故障排除

### Node 版本问题

```bash
# 检查 Node 版本
node --version

# 应该显示 >= 14.0.0
# 如果不是，使用 nvm 切换
nvm install 18
nvm use 18
```

### 依赖安装失败

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 权限错误

```bash
# 确保目标目录有读写权限
chmod -R u+rw ~/Desktop

# 或使用用户目录
# 避免整理系统目录 (/System, /Library 等)
```

## 限制

1. **macOS 特定**: 某些功能针对 macOS 优化（.app 识别等）
2. **目录大小**: 超过 1000 个文件的目录可能需要较长时间
3. **网络搜索**: 未知软件的搜索需要网络连接

## 开发

### 项目结构

```
tidymydesktop/
├── SKILL.md          # Claude skill 提示词
├── README.md         # 项目说明
├── TEST_REPORT.md    # 测试报告
├── LICENSE           # MIT 许可证
├── package.json      # Node.js 配置
├── test.sh           # 一键测试脚本
└── scripts/          # 工具脚本
    ├── scan.js       # 目录扫描
    ├── organize.js   # 文件整理
    └── classify.js   # 智能分类
```

### 运行测试

<details>
<summary><b>macOS / Linux</b></summary>

```bash
# 快速测试（推荐）
./test.sh

# 或手动测试
npm test

# 查看测试报告
cat TEST_REPORT.md
```

</details>

<details>
<summary><b>Windows</b></summary>

```cmd
REM 快速测试（推荐）
test.bat

REM 或手动测试
npm test

REM 查看测试报告
type TEST_REPORT.md
```

</details>

**测试结果**: ✅ 所有测试通过 (10/10, 100%)

详细测试报告请查看 [TEST_REPORT.md](./TEST_REPORT.md)

### 贡献

欢迎提交 Issue 和 Pull Request！

## 版本历史

- **v1.0.0** (2024-01-15)
  - 初始版本
  - 支持桌面和目录整理
  - 智能分类和版本管理
  - Markdown 报告生成

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 作者

Claude AI

## 致谢

感谢 Claude Code 团队提供的 skill 框架和工具支持。
