# AI Agent Team 本地安装指南

## 📦 安装本地 npm 包文件

### 方法 1: 全局安装（推荐）

全局安装后可以在任何位置使用 `ai-agent-team` 命令。

```bash
# 方式 1: 使用绝对路径
npm install -g /path/to/your/project/ai-agent-team-1.0.1.tgz

# 方式 2: 使用相对路径（如果在同一目录下）
npm install -g ./ai-agent-team-1.0.1.tgz

# 方式 3: 使用 file: 协议
npm install -g file:/path/to/your/project/ai-agent-team-1.0.1.tgz
```

#### 验证全局安装
```bash
# 查看安装位置
npm list -g ai-agent-team

# 查看版本
npm list -g ai-agent-team --depth=0

# 测试命令
ai-agent-team --version
```

### 方法 2: 项目本地安装

在特定项目中安装，只在该项目中可用。

```bash
# 创建或进入项目目录
mkdir my-project
cd my-project
npm init -y

# 安装本地包
npm install /path/to/your/project/ai-agent-team-1.0.1.tgz

# 或者使用相对路径
npm install ../ai-agent/ai-agent-team-1.0.1.tgz
```

#### 验证本地安装
```bash
# 查看安装的包
npm list ai-agent-team

# 查看 node_modules
ls -la node_modules/ai-agent-team/
```

### 方法 3: 使用 npx 临时运行

不安装，直接运行：

```bash
npx /path/to/your/project/ai-agent-team-1.0.1.tgz
```

## 🔧 安装后配置

### 1. 验证安装

```bash
# 检查安装位置（全局）
which ai-agent-team

# 或
npm root -g

# 查看安装的文件
ls -la $(npm root -g)/ai-agent-team/
```

### 2. 查看配置文件

```bash
# 智能体配置
ls -la ~/.claude/agents/

# 快捷命令
ls -la ~/.claude/commands/

# 插件系统
ls -la ~/.claude-plugin/
```

### 3. 安装插件依赖（重要！）

安装后需要手动安装 DrawNote Skill 的依赖：

```bash
# 进入插件目录
cd ~/.claude-plugin/drawnote-skill

# 安装依赖
npm install

# 安装浏览器
npm run install-browsers
# 或
npx playwright install chromium
```

## 🧪 测试安装

### 测试智能体

```bash
# 在 Claude Code 中测试
/pm "设计一个用户登录功能"
/fe "创建登录表单组件"
/be "实现JWT认证API"
/qa "测试登录流程"
/ops "部署到生产环境"
/tl "评估系统架构"
```

### 测试插件

```bash
# 在 Claude Code 中测试 DrawNote Skill
请帮我创建一个关于"人工智能"的信息图
请使用彩色手写笔记风格生成"机器学习"的信息图
```

## 🔄 更新和卸载

### 更新安装

```bash
# 全局更新
npm uninstall -g ai-agent-team
npm install -g /path/to/ai-agent-team-1.0.1.tgz

# 或直接覆盖安装
npm install -g /path/to/ai-agent-team-1.0.1.tgz --force
```

### 卸载

```bash
# 全局卸载
npm uninstall -g ai-agent-team

# 本地卸载
npm uninstall ai-agent-team

# 清理配置文件（可选）
rm -rf ~/.claude/agents/
rm -rf ~/.claude/commands/
rm -rf ~/.claude-plugin/
```

## ⚠️ 常见问题

### 问题 1: 权限错误

如果遇到 `EACCES` 权限错误：

```bash
# 方法 1: 使用 sudo（不推荐）
sudo npm install -g /path/to/ai-agent-team-1.0.1.tgz

# 方法 2: 修改 npm 全局目录权限（推荐）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 然后重新安装
npm install -g /path/to/ai-agent-team-1.0.1.tgz
```

### 问题 2: 路径错误

确保使用正确的路径：

```bash
# 查看当前目录
pwd

# 查看文件是否存在
ls -la ai-agent-team-1.0.1.tgz

# 使用绝对路径
npm install -g "$(pwd)/ai-agent-team-1.0.1.tgz"
```

### 问题 3: 插件依赖未安装

如果 DrawNote Skill 无法使用：

```bash
# 检查插件目录
ls -la ~/.claude-plugin/drawnote-skill/

# 安装依赖
cd ~/.claude-plugin/drawnote-skill
npm install
npx playwright install chromium
```

### 问题 4: Node 版本不兼容

```bash
# 检查 Node 版本
node --version

# 要求: >= 16.0.0
# 如果版本过低，使用 nvm 更新
nvm install 18
nvm use 18
```

## 💡 高级用法

### 在 package.json 中引用本地包

```json
{
  "dependencies": {
    "ai-agent-team": "file:../ai-agent/ai-agent-team-1.0.1.tgz"
  }
}
```

然后运行：
```bash
npm install
```

### 创建符号链接测试

用于开发和测试：

```bash
# 在包目录中
cd /path/to/your/project
npm link

# 在另一个项目中使用
cd ~/my-project
npm link ai-agent-team
```

### 使用环境变量

```bash
# 设置自定义配置
export CLAUDE_CONFIG_PATH=~/.claude
export CLAUDE_PLUGIN_PATH=~/.claude-plugin

# 然后安装
npm install -g ./ai-agent-team-1.0.1.tgz
```

## 📊 安装验证清单

- [ ] npm 包安装成功（无错误）
- [ ] 配置文件已复制到 ~/.claude/
- [ ] 插件文件已复制到 ~/.claude-plugin/
- [ ] 插件依赖已安装（playwright）
- [ ] Playwright 浏览器已安装（chromium）
- [ ] 智能体命令可用（/pm, /fe, /be, /qa, /ops, /tl）
- [ ] DrawNote Skill 可用
- [ ] CLI 工具可执行（如有）

## 🔗 相关命令参考

```bash
# npm 安装相关
npm install -g <package>           # 全局安装
npm install <package>              # 本地安装
npm install -g <package> --force   # 强制重新安装
npm uninstall -g <package>         # 全局卸载

# npm 查询相关
npm list -g --depth=0              # 查看全局包
npm list <package>                 # 查看特定包
npm root -g                        # 查看全局安装目录
npm config get prefix              # 查看 npm 前缀

# 包管理
npm pack                           # 打包
npm publish                        # 发布
npm unpublish <package>@<version>  # 撤销发布
```

## 📞 需要帮助？

如果安装过程中遇到问题：

1. 查看 [PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md)
2. 查看 [README.md](README.md)
3. 提交 Issue: https://github.com/peterfei/ai-agent-team/issues

---

**安装愉快！** 🚀
