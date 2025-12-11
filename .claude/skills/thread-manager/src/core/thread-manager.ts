import { DatabaseManager, ThreadsDAO, MessagesDAO, FileChangesDAO } from '../database';
import { GitIntegration } from '../git/git-integration';
import { XenovaEmbeddingService } from './embedding-service';
import { v4 as uuidv4 } from 'uuid';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import path from 'path';
import fs from 'fs-extra';

import { Thread, Message, FileChange, CreateThreadInput, ListThreadsInput, UpdateThreadInput } from '../types';

export class ThreadManager {
  private dbManager: DatabaseManager;
  private threadsDAO: ThreadsDAO;
  private messagesDAO: MessagesDAO;
  private fileChangesDAO: FileChangesDAO;
  private gitIntegration: GitIntegration;
  private embeddingService: XenovaEmbeddingService;
  private claudeContextPath = path.join(process.cwd(), '.claude', '.threads', 'current-context.md');

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
    this.embeddingService = new XenovaEmbeddingService();
    this.threadsDAO = new ThreadsDAO(dbManager);
    this.messagesDAO = new MessagesDAO(dbManager, this.embeddingService);
    this.fileChangesDAO = new FileChangesDAO(dbManager);
    this.gitIntegration = new GitIntegration();
    fs.ensureDirSync(path.dirname(this.claudeContextPath)); // Ensure directory exists on startup
  }

  public get messagesDAOInstance(): MessagesDAO {
    return this.messagesDAO;
  }

  private async updateClaudeMd(thread: Thread, messages: Message[]): Promise<void> {
    // 格式化历史消息
    const historyText = messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleString('zh-CN');
      const roleText = msg.role === 'user' ? '用户' : '助手';
      return `### [${time}] ${roleText}\n\n${msg.content}\n`;
    }).join('\n---\n\n');

    const content = `# 📋 当前线程上下文\n\n**⚠️ 重要：上下文隔离规则**\n\n您当前在独立的对话线程中工作。请**严格遵守**以下规则：\n\n1. **只参考本文档中的历史对话**\n2. **忽略本线程之外的所有内容**\n3. **不要引用或提及其他线程的信息**\n\n---\n\n## 线程信息\n\n- 📋 标题：${thread.title}\n- 📝 描述：${thread.description || '无'}\n- 🆔 ID：${thread.id}\n- 🌿 Git 分支：${thread.gitBranch || '无'}\n- 🏷️  标签：${thread.metadata.tags?.join(', ') || '无'}\n- 📊 消息数：${thread.messageCount}\n\n---\n\n## 历史对话\n\n${historyText || '暂无历史对话'}\n\n---\n\n**再次强调：请只参考上述对话内容进行回复，忽略本线程之外的所有历史记录。**\n`;

    // 写入文件
    await fs.writeFile(this.claudeContextPath, content, 'utf-8');
  }

  public async createThread(input: CreateThreadInput): Promise<{ thread: Thread, message: string, launchCommand: string }> {
    const { title, description, tags, switchTo = true } = input;

    // 1. 生成 UUID
    const threadId = uuidv4();

    // 2. 准备 Git 分支名（但不立即创建，延迟到切换时）
    let gitBranch: string | undefined;
    if (await this.gitIntegration.isGitRepo()) {
      gitBranch = `thread/${threadId.substring(0, 8)}`;
      // 注意：分支将在首次切换到此 thread 时创建，避免阻塞
    }

    // 3. 创建 Thread 记录
    // 先创建为非激活状态，如果是 switchTo=true，后面会统一调用 setActive 处理互斥
    let newThread = this.threadsDAO.create({
      id: threadId,
      sessionId: threadId,  // 相同
      title,
      description,
      gitBranch,
      isActive: false, 
      metadata: {
        filesChanged: 0,
        linesAdded: 0,
        linesDeleted: 0,
        tags: tags || []
      }
    });

    // 4. 处理切换逻辑 (默认为 true)
    if (switchTo) {
      this.threadsDAO.setActive(threadId);
      newThread.isActive = true; // 更新内存中的对象状态
      
      // 更新 CLAUDE.md 上下文
      await this.updateClaudeMd(newThread, []);
    }

    // 5. 生成启动命令
    const launchCommand = `claude --session-id ${threadId}`;

    // 6. 返回结果（快速返回，不阻塞）
    return {
      thread: newThread,
      message: this.formatCreateMessage(newThread),
      launchCommand
    };
  }

  private formatCreateMessage(thread: Thread): string {
    const shortId = thread.id.substring(0, 8);
    const gitBranchInfo = thread.gitBranch ? `- **Git 分支**: \`${thread.gitBranch}\`` : '';
    
    return `### ✨ 新线程已创建

- **标题**: ${thread.title}
- **ID**: \`${shortId}\`
${gitBranchInfo}

**🚀 启动独立会话**:
\`claude --session-id ${thread.id}\`
或: \`clt ${shortId}\`
`;
  }

  private formatCombinedSwitchMessage(thread: Thread, messages: Message[]): string {
    const shortId = thread.id.substring(0, 8);

    // Filter out commands and format context messages
    const contextMessages = messages.filter(msg => !msg.content.trim().startsWith('/'));
    const displayLimit = 5; // Reduced limit
    const recentMessages = contextMessages
      .slice(0, displayLimit)
      .reverse()
      .map(msg => {
        const time = formatDistanceToNow(msg.timestamp, { locale: zhCN });
        const preview = msg.content.substring(0, 60).replace(/\n/g, ' ');
        const icon = msg.role === 'user' ? '👤' : '🤖';
        return `- ${time} ${icon} ${preview}${msg.content.length > 60 ? '...' : ''}`;
      })
      .join('\n');

    const contextSection = contextMessages.length > 0
      ? `**💬 最近消息**:\n${recentMessages}\n`
      : '';
      
    const gitBranchInfo = thread.gitBranch ? `- **Git**: \`${thread.gitBranch}\`` : '';

    return `### 🔄 已切换到线程

- **标题**: ${thread.title}
- **ID**: \`${shortId}\`
${gitBranchInfo}
- **统计**: ${messages.length} 消息 | ${thread.metadata.filesChanged} 文件变更

${contextSection}
**⚠️  完全隔离上下文**:
推荐重启: \`exit\` 后运行 \`claude --session-id ${thread.id}\`
`;
  }

  public async getThread(id: string, includeMessages: boolean = false, includeFileChanges: boolean = false, messageLimit: number = 50): Promise<{ thread: Thread | null, messages?: Message[], fileChanges?: FileChange[] }> {
    const thread = this.threadsDAO.findById(id);
    if (!thread) {
      return { thread: null };
    }

    let messages: Message[] | undefined;
    if (includeMessages) {
      messages = this.messagesDAO.findByThreadId(id, { limit: messageLimit });
    }

    let fileChanges: FileChange[] | undefined;
    if (includeFileChanges) {
      fileChanges = this.fileChangesDAO.findByThreadId(id);
    }

    return { thread, messages, fileChanges };
  }

  public async listThreads(input: ListThreadsInput): Promise<{ threads: Thread[], total: number, currentThreadId?: string, message: string }> {
    const { threads, total } = this.threadsDAO.findAll(input);
    const currentActive = this.threadsDAO.getActive();

    // Format the message for display
    const message = this.formatListThreadsMessage(threads, total, currentActive?.id);

    return {
      threads,
      total,
      currentThreadId: currentActive?.id,
      message
    };
  }

  private formatListThreadsMessage(threads: Thread[], total: number, currentThreadId?: string): string {
    if (threads.length === 0) {
      return `📋 **线程列表**: 暂无线程。使用 \`/thread create <title>\` 创建。`;
    }

    const rows = threads.map(thread => {
      const isActive = thread.id === currentThreadId;
      const status = isActive ? '✅' : '  ';
      const shortId = thread.id.substring(0, 8);
      const title = thread.title.length > 40 ? thread.title.substring(0, 37) + '...' : thread.title;
      const timeAgo = formatDistanceToNow(thread.updatedAt, { locale: zhCN, addSuffix: true });
      
      // Compact format: Status | ID | Title (Msgs, Files) | Time
      return `\`${status} ${shortId}\` **${title}** (${thread.messageCount} msg, ${thread.metadata.filesChanged} files) - ${timeAgo}`;
    }).join('\n');

    return `### 📋 线程列表 (总计: ${total})

${rows}
`;
  }

  public findThreadsByPrefix(prefix: string): Thread[] {
    return this.threadsDAO.findByPrefix(prefix);
  }

  public async updateThread(id: string, updates: UpdateThreadInput): Promise<{ success: boolean, thread?: Thread, message: string }> {
    const existingThread = this.threadsDAO.findById(id);
    if (!existingThread) {
      return { success: false, message: `Thread with ID ${id} not found.` };
    }

    // Map UpdateThreadInput to Partial<Thread>
    const threadUpdates: Partial<Thread> = {
        title: updates.title,
        description: updates.description,
        gitBranch: updates.gitBranch,
    };

    if (updates.tags) {
        threadUpdates.metadata = {
            ...existingThread.metadata,
            tags: updates.tags
        };
    }

    const updatedThread = this.threadsDAO.update(id, threadUpdates);
    if (!updatedThread) {
      return { success: false, message: `Failed to update thread with ID ${id}.` };
    }

    return { success: true, thread: updatedThread, message: `Thread "${updatedThread.title}" (${updatedThread.id}) updated successfully.` };
  }

  public async deleteThread(id: string): Promise<{ success: boolean, message: string }> {
    // Check if it's the active thread
    const currentActive = this.threadsDAO.getActive();
    if (currentActive?.id === id) {
      return { success: false, message: "Cannot delete the currently active thread. Please switch to another thread first." };
    }
    
    const deleted = this.threadsDAO.delete(id);
    if (!deleted) {
      return { success: false, message: `Thread with ID ${id} not found or failed to delete.` };
    }

    // Due to ON DELETE CASCADE in SQLite schema, messages and file_changes are automatically deleted.
    return { success: true, message: `Thread with ID ${id} deleted successfully.` };
  }

  public async switchThread(
    id: string,
    options?: { forceIsolate?: boolean }
  ): Promise<{
    success: boolean,
    thread?: Thread,
    messages?: Message[],
    message: string,
    launchCommand?: string
  }> {
    // 1. 查找目标 thread
    const targetThread = this.threadsDAO.findById(id);
    if (!targetThread) {
      return {
        success: false,
        message: `Thread with ID ${id} not found.`
      };
    }

    // 2. 切换 Git 分支（如果需要，先创建）
    if (targetThread.gitBranch) {
      // 检查分支是否存在
      const branchExists = await this.gitIntegration.branchExists(targetThread.gitBranch);

      if (!branchExists) {
        // 分支不存在，创建它（延迟创建策略）
        const created = await this.gitIntegration.createAndCheckoutBranch(targetThread.gitBranch);
        if (!created) {
          return {
            success: false,
            message: `Failed to create Git branch ${targetThread.gitBranch}`
          };
        }
      } else {
        // 分支存在，直接切换
        const switched = await this.gitIntegration.checkoutBranch(targetThread.gitBranch);
        if (!switched) {
          return {
            success: false,
            message: `Failed to switch to Git branch ${targetThread.gitBranch}`
          };
        }
      }
    }

    // Set target thread as active
    this.threadsDAO.setActive(id);
    targetThread.isActive = true; // Update in-memory object

    // 3. 加载历史消息 (for CLAUDE.md and display)
    const messages = this.messagesDAO.findByThreadId(id, { limit: 50 });

    // 4. 更新 CLAUDE.md（注入上下文提示）
    await this.updateClaudeMd(targetThread, messages);

    // 5. 生成切换命令
    const launchCommand = `claude --session-id ${targetThread.id}`;

    // 6. 生成组合消息
    const combinedMessage = this.formatCombinedSwitchMessage(targetThread, messages);

    return {
      success: true,
      thread: targetThread,
      messages, // 返回原始消息数组，供 Claude CLI 可能的进一步处理
      message: combinedMessage,
      launchCommand
    };
  }

  public async getCurrentThread(includeMessages: boolean = false, includeFileChanges: boolean = false, messageLimit: number = 50): Promise<{ thread?: Thread, messages?: Message[], fileChanges?: FileChange[], message?: string }> {
    const activeThread = this.threadsDAO.getActive();
    if (!activeThread) {
      return { message: "No active thread found." };
    }

    const { thread, messages, fileChanges } = await this.getThread(activeThread.id, includeMessages, includeFileChanges, messageLimit);
    if (!thread) {
      return { message: "Active thread not found in database (unexpected)." }; // Should not happen if getActive returns one
    }
    return { thread, messages, fileChanges };
  }

  public async addMessageToThread(threadId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>): Promise<Message> {
    // Ensure thread exists and is active (or specified threadId is the active one)
    const activeThread = this.threadsDAO.getActive();
    if (!activeThread || activeThread.id !== threadId) {
      throw new Error(`Thread with ID ${threadId} is not the active thread or does not exist. Cannot add message.`);
    }

    const message = await this.messagesDAO.create({ threadId, role, content, metadata });
    return message;
  }

  public async trackFileChange(threadId: string, filePath: string, changeType?: 'added' | 'modified' | 'deleted', linesAdded?: number, linesDeleted?: number, gitCommit?: string): Promise<FileChange> {
    // Ensure thread exists and is active
    const activeThread = this.threadsDAO.getActive();
    if (!activeThread || activeThread.id !== threadId) {
      throw new Error(`Thread with ID ${threadId} is not the active thread or does not exist. Cannot track file change.`);
    }

    // Auto-detect stats if not provided
    if (linesAdded === undefined || linesDeleted === undefined || changeType === undefined) {
        const stats = await this.gitIntegration.getFileStats(filePath);
        if (linesAdded === undefined) linesAdded = stats.added;
        if (linesDeleted === undefined) linesDeleted = stats.deleted;
        if (changeType === undefined) changeType = stats.changeType;
    }

    // Auto-detect commit hash if not provided
    if (!gitCommit) {
        gitCommit = await this.gitIntegration.getCurrentCommit();
    }

    const fileChange = this.fileChangesDAO.create({ 
        threadId, 
        filePath, 
        changeType: changeType!, 
        linesAdded, 
        linesDeleted, 
        gitCommit 
    });
    return fileChange;
  }
}
