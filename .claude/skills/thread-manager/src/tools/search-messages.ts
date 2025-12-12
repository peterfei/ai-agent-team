import { z } from 'zod';
import { ThreadManager } from '../core/thread-manager';
import { ToolDefinition, Message } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Input schema for the search_messages tool
export const SearchMessagesInputSchema = z.object({
  query: z.string().describe('The natural language query to search for messages.'),
  threadId: z.string().optional().describe('Optional: The ID of the thread to search within. If not provided, searches the current active thread.'),
  topK: z.number().int().min(1).default(5).optional().describe('Optional: The maximum number of similar messages to return. Defaults to 5.'),
  minScore: z.number().min(0).max(1).default(0.6).optional().describe('Optional: The minimum similarity score (0-1) for results to be included. Defaults to 0.6.'),
});

// Tool definition for MCP
export const toolDefinition: ToolDefinition = {
  name: 'search_messages',
  description: 'Semantically searches for relevant messages in the conversation history based on a natural language query.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The natural language query to search for messages.' },
      threadId: { type: 'string', description: 'Optional: The ID of the thread to search within. If not provided, searches the current active thread.' },
      topK: { type: 'number', description: 'Optional: The maximum number of similar messages to return. Defaults to 5.' },
      minScore: { type: 'number', description: 'Optional: The minimum similarity score (0-1) for results to be included. Defaults to 0.6.' },
    },
    required: ['query'],
  },
};

// Tool handler function
export async function toolHandler(toolInvocation: { toolName: string, input: any }, threadManager: ThreadManager): Promise<{ message: string, info?: any, isError?: boolean }> {
  const parsedInput = SearchMessagesInputSchema.safeParse(toolInvocation.input);

  if (!parsedInput.success) {
    return {
      message: `Invalid input for search_messages: ${parsedInput.error.errors.map(e => e.message).join(', ')}`,
      isError: true,
    };
  }

  const { query, threadId, topK, minScore } = parsedInput.data;

  try {
    // Determine the thread ID to search within
    let targetThreadId = threadId;
    if (!targetThreadId) {
      const activeThread = await threadManager.getCurrentThread();
      if (activeThread.thread) {
        targetThreadId = activeThread.thread.id;
      } else {
        return {
          message: 'No active thread found and no threadId provided. Cannot perform search.',
          isError: true,
        };
      }
    }

    // Perform the search
    const results = await threadManager.messagesDAOInstance.searchSimilar(query, {
      threadId: targetThreadId,
      topK,
      minScore,
    });

    // Format the results for display
    const formatted = results.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content.substring(0, 200) + (msg.content.length > 200 ? '...' : ''),
      timestamp: formatDistanceToNow(msg.timestamp, { locale: zhCN, addSuffix: true }),
      score: msg.score.toFixed(3),
      threadId: msg.threadId
    }));

    const message = formatSearchResults(query, formatted);

    return {
      message,
      info: JSON.stringify({
        resultCount: results.length,
        avgScore: results.length > 0 ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(3) : '0.000'
      }, null, 2) // 格式化为可读的 JSON 字符串
    };
  } catch (error: any) {
    return {
      message: `Error performing search: ${error.message}`,
      isError: true,
    };
  }
}

/**
 * Formats search results into a human-readable Markdown string.
 */
function formatSearchResults(
  query: string,
  results: Array<{ role: string; content: string; score: string; timestamp: string, id: string, threadId: string }>
): string {
  if (results.length === 0) {
    return `🔍 未找到与 "${query}" 相关的消息。`;
  }

  let output = `### 🔍 搜索结果: "${query}"\n\n`;
  output += `找到 ${results.length} 条相关消息：\n\n`;

  results.forEach((result, index) => {
    const icon = result.role === 'user' ? '👤' : '🤖';
    const shortId = result.id.substring(0, 8);
    output += `**${index + 1}. ${icon} ${result.role}** (相似度: ${result.score}) - ID: \`${shortId}\`\n`;
    output += `🕒 ${result.timestamp}\n`;
    output += `> ${result.content}\n\n`;
  });

  return output;
}
