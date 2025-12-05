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

    let messageText = `### 📋 当前线程信息

- **标题**: ${thread.title}
- **ID**: \`${shortId}\`
- **描述**: ${thread.description || '无'}
${thread.gitBranch ? `- **Git 分支**: \`${thread.gitBranch}\`` : ''}
- **统计**: ${thread.messageCount} 消息 | ${thread.metadata.filesChanged} 文件变更 | +${thread.metadata.linesAdded} -${thread.metadata.linesDeleted} 行代码
`;

    if (includeMessages && result.messages && result.messages.length > 0) {
      messageText += `\n**💬 消息历史** (最近 ${Math.min(result.messages.length, 10)} 条):\n`;
      result.messages.slice(0, 10).reverse().forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleString('zh-CN');
        const roleText = msg.role === 'user' ? '👤' : '🤖';
        const preview = msg.content.substring(0, 80).replace(/\n/g, ' ');
        messageText += `- ${time} ${roleText}: ${preview}${msg.content.length > 80 ? '...' : ''}\n`;
      });
    }

    if (includeFileChanges && result.fileChanges && result.fileChanges.length > 0) {
      messageText += `\n**📁 文件变更** (最近 ${Math.min(result.fileChanges.length, 10)} 个):\n`;
      result.fileChanges.slice(0, 10).forEach(fc => {
        const time = new Date(fc.timestamp).toLocaleString('zh-CN');
        messageText += `- ${time} \`${fc.changeType}\` ${fc.filePath} (+${fc.linesAdded} -${fc.linesDeleted})\n`;
      });
    }

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
