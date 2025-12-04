import { ToolDefinition, ToolInvocation } from '../types';
import { ThreadManager } from '../core/thread-manager';

export const toolDefinition: ToolDefinition = {
  name: 'get_current_thread',
  description: 'Get information about the currently active thread.',
  inputSchema: {
    type: 'object',
    properties: {
      includeMessages: {
          type: 'boolean',
          description: 'Include message history (default: false)'
      },
      includeFileChanges: {
          type: 'boolean',
          description: 'Include file change history (default: false)'
      }
    }
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
  const { includeMessages, includeFileChanges } = invocation.input as any || {};
  const result = await threadManager.getCurrentThread(includeMessages, includeFileChanges);

  // Format the result as a message if there's a thread
  if (result.thread) {
    const thread = result.thread;
    const shortId = thread.id.substring(0, 8);

    let messageText = `
═══════════════════════════════════════════════════════════════
  📋 当前线程信息
═══════════════════════════════════════════════════════════════

📋 标题：${thread.title}
📝 描述：${thread.description || '无'}
🆔 ID：${shortId}
${thread.gitBranch ? `🌿 Git 分支：${thread.gitBranch}` : ''}

📊 统计信息：
   • 消息数：${thread.messageCount}
   • 文件变更：${thread.metadata.filesChanged}
   • 代码行：+${thread.metadata.linesAdded} -${thread.metadata.linesDeleted}
`;

    if (includeMessages && result.messages && result.messages.length > 0) {
      messageText += `\n💬 消息历史（最近 ${result.messages.length} 条）：\n`;
      result.messages.slice(0, 10).reverse().forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleString('zh-CN');
        const roleText = msg.role === 'user' ? '👤 用户' : '🤖 助手';
        const preview = msg.content.substring(0, 100);
        messageText += `   ${time} ${roleText}：${preview}${msg.content.length > 100 ? '...' : ''}\n`;
      });
    }

    if (includeFileChanges && result.fileChanges && result.fileChanges.length > 0) {
      messageText += `\n📁 文件变更（${result.fileChanges.length} 个）：\n`;
      result.fileChanges.slice(0, 10).forEach(fc => {
        const time = new Date(fc.timestamp).toLocaleString('zh-CN');
        messageText += `   ${time} ${fc.changeType} ${fc.filePath} (+${fc.linesAdded} -${fc.linesDeleted})\n`;
      });
    }

    messageText += `\n═══════════════════════════════════════════════════════════════\n`;

    return {
      ...result,
      message: messageText
    };
  }

  // If no thread found, return the message directly
  return {
    message: result.message || 'No active thread found.'
  };
};
