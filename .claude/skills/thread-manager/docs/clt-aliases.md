# Claude Thread Manager Shell 快捷命令

为了简化线程管理操作，您可以将以下别名和函数添加到您的 shell 配置文件中（例如 `~/.bashrc`, `~/.zshrc` 或 `~/.profile`）。

## 1. 安装要求

确保您的系统上安装了 `sqlite3` 命令行工具。大多数 Linux 和 macOS 系统都已预装。

## 2. 添加到您的 Shell 配置文件

打开您的 shell 配置文件：

```bash
# 例如，对于 Bash 用户
nano ~/.bashrc

# 例如，对于 Zsh 用户
nano ~/.zshrc
```

在文件末尾添加以下内容：

```bash
# Claude Thread 快捷命令
function clt() {
  local thread_prefix="$1"

  if [ -z "$thread_prefix" ]; then
    echo "用法: clt <thread-id-prefix>"
    echo "示例: clt 11a2a6a2"
    return 1
  fi

  # 查询数据库获取完整 ID
  local db_path="$HOME/.claude/threads/threads.db"
  local full_id=$(sqlite3 "$db_path" \
    "SELECT id FROM threads WHERE id LIKE '$thread_prefix%' LIMIT 1" 2>/dev/null)

  if [ -z "$full_id" ]; then
    echo "❌ 错误：找不到匹配的 thread ID"
    return 1
  fi

  echo "🚀 启动 thread: $full_id"

  # 获取并切换 Git 分支
  local branch=$(sqlite3 "$db_path" \
    "SELECT git_branch FROM threads WHERE id='$full_id'" 2>/dev/null)

  if [ -n "$branch" ]; then
    echo "🌿 切换分支: $branch"
    git checkout "$branch" 2>/dev/null
  fi

  # 启动 Claude 会话
  claude --session-id "$full_id"
}

# 列出所有 threads
function clt-list() {
  local db_path="$HOME/.claude/threads/threads.db"

  echo "📋 所有线程："
  sqlite3 -header -column "$db_path" \
    "SELECT
       substr(id, 1, 8) as 'ID前缀',
       title as '标题',
       message_count as '消息数',
       datetime(updated_at/1000, 'unixepoch', 'localtime') as '更新时间'
     FROM threads
     ORDER BY updated_at DESC"
}
```

保存文件并关闭编辑器。

## 3. 重新加载 Shell 配置

执行以下命令使更改生效：

```bash
# 例如，对于 Bash 用户
source ~/.bashrc

# 例如，对于 Zsh 用户
source ~/.zshrc
```

## 4. 使用示例

### 启动一个线程会话

使用线程 ID 的前缀即可：

```bash
clt 11a2a6a2
```

### 列出所有线程

```bash
clt-list
```
