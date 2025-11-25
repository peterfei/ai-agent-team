# SoftCopyright - Claude Skill

智能软件著作权申请材料生成工具，让软著申请变得简单高效。

## 平台支持

✅ **Windows** | ✅ **macOS** | ✅ **Linux**

- Windows 10/11 (使用 .bat 批处理文件)
- macOS 10.14+ (使用 .sh shell 脚本)
- Linux (各种发行版，使用 .sh shell 脚本)

## 功能特点

- **智能项目分析**: 自动识别项目类型、技术栈和架构模式
- **软件说明书生成**: 生成约2000-3000字的详细软件说明书（HTML格式）
- **源代码文档生成**: 生成规范的源代码文档（HTML格式，可打印为PDF）
- **版本自动识别**: 从package.json、setup.py等配置文件自动读取版本号
- **页眉页脚支持**: 打印时自动添加软件名称和版本号
- **多语言支持**: 支持JavaScript、Python、Java、Go、Rust等主流编程语言
- **关键词触发**: 支持"软著"、"copyright"等关键词自动触发生成流程

## 安装

### 前置要求

- **Node.js >= 14.0.0** (必需)
- nvm (可选，推荐用于 Node 版本管理)

### 安装步骤

```bash
# 1. 确保 skill 已经在正确位置
cd ~/.claude/skills/softcopyright

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

1. "帮我生成软著材料"
2. "生成软件著作权申请文档"
3. 输入关键词：软著、著作权、copyright等

### 命令行使用

#### 方式 1: 使用快捷命令（推荐）

<details>
<summary><b>macOS / Linux</b></summary>

```bash
# 生成完整的软著材料（软件说明书 + 源代码文档）
~/.claude/skills/softcopyright/softcopyright-generate --project /path/to/project

# 仅生成软件说明书
~/.claude/skills/softcopyright/softcopyright-manual --project /path/to/project

# 仅生成源代码文档
~/.claude/skills/softcopyright/softcopyright-source --project /path/to/project

# 指定输出目录
~/.claude/skills/softcopyright/softcopyright-generate --project /path/to/project --output ~/Desktop/output

# 扫描项目
~/.claude/skills/softcopyright/softcopyright scan /path/to/project
```

</details>

<details>
<summary><b>Windows</b></summary>

```cmd
REM 生成完整的软著材料
%USERPROFILE%\.claude\skills\softcopyright\softcopyright-generate.bat --project C:\path\to\project

REM 仅生成软件说明书
%USERPROFILE%\.claude\skills\softcopyright\softcopyright-manual.bat --project C:\path\to\project

REM 仅生成源代码文档
%USERPROFILE%\.claude\skills\softcopyright\softcopyright-source.bat --project C:\path\to\project

REM 指定输出目录
%USERPROFILE%\.claude\skills\softcopyright\softcopyright-generate.bat --project C:\path\to\project --output %USERPROFILE%\Desktop\output

REM 扫描项目
%USERPROFILE%\.claude\skills\softcopyright\softcopyright.bat scan C:\path\to\project
```

</details>

#### 方式 2: 使用 npm scripts

```bash
# 进入 skill 目录
cd ~/.claude/skills/softcopyright

# 生成软件说明书
npm run manual

# 生成源代码文档
npm run source

# 扫描项目
npm run scan
```

## 生成的文档

### 软件说明书 (HTML格式)

包含以下内容：
- 软件基本信息（名称、版本、类型）
- 运行环境要求
- 主要功能描述
- 技术架构说明
- 项目统计信息

### 源代码文档 (HTML格式)

包含以下内容：
- 源代码文件列表
- 每个文件的详细信息（语言、行数、大小）
- 代码示例展示

### 打印为PDF

生成的HTML文件可以通过浏览器打印为PDF：

1. 在浏览器中打开生成的HTML文件
2. 按 `Cmd+P` (Mac) 或 `Ctrl+P` (Windows/Linux)
3. 在打印设置中：
   - 展开"更多设置"
   - 勾选"页眉和页脚"选项
   - 浏览器会自动在页眉显示软件名称和版本号
   - 浏览器会自动在页脚添加页码

## 配置选项

### 命令行参数

| 参数 | 别名 | 说明 | 默认值 |
|------|------|------|--------|
| `--project` | `-p` | 项目路径 | 当前目录 |
| `--output` | `-o` | 输出目录 | `~/Desktop/softcopyright-output` |

### 支持的项目类型

- **Node.js**: 自动读取 package.json 中的版本号
- **Python**: 支持 setup.py、pyproject.toml
- **Rust**: 支持 Cargo.toml
- **Go**: 支持 go.mod
- **其他**: 默认版本号 V1.0.0

## 示例

### 生成完整材料

```bash
# macOS/Linux
~/.claude/skills/softcopyright/softcopyright-generate --project ~/my-project

# Windows
%USERPROFILE%\.claude\skills\softcopyright\softcopyright-generate.bat --project %USERPROFILE%\my-project
```

输出：
```
📋 SoftCopyright - 软著材料生成工具
============================================================

🔍 扫描项目...
📊 分析源代码文件...
✅ 扫描完成: 25 个文件, 3840 行代码

📄 生成软件说明书...
✅ 软件说明书_my-project_20251125_143052.html

📄 生成源代码文档...
✅ 源代码文档_my-project_20251125_143053.html

🎉 生成完成！

📁 输出目录: ~/Desktop/softcopyright-output
💡 提示: 在浏览器中打开HTML文件，按Cmd+P打印为PDF
```

## 常见问题

### Q: 生成的文档中文显示乱码？
A: 本工具使用HTML格式，浏览器会自动处理中文显示，不会出现乱码问题。

### Q: 如何自定义输出路径？
A: 使用 `--output` 参数指定输出目录。

### Q: 支持哪些编程语言？
A: 支持JavaScript、TypeScript、Python、Java、C/C++、Go、Rust等主流编程语言。

### Q: 页码不递增怎么办？
A: 在打印预览中，展开"更多设置"并勾选"页眉和页脚"选项，浏览器会自动添加递增的页码。

### Q: 如何更改软件版本号？
A: 修改项目中的 package.json、setup.py 等配置文件中的version字段。

## 版本历史

### v1.0.3 (2025-11-25)
- 修复页眉页脚显示问题
- 修复版本号读取路径错误
- 优化打印时的页码显示
- 添加npm包发布支持
- 创建命令行工具和快捷命令

### v1.0.2
- 添加HTML格式生成
- 移除PDF直接生成（改用浏览器打印）
- 修复中文字符显示问题

### v1.0.1
- 初始版本发布
- 支持基础的文档生成功能

## 许可证

MIT License

## 作者

Peterfei

## 贡献

欢迎提交 Issues 和 Pull Requests！

## 相关链接

- [CHANGELOG.md](./CHANGELOG.md) - 完整的版本历史
- [SKILL.md](./SKILL.md) - Skill 开发文档
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - 使用示例
