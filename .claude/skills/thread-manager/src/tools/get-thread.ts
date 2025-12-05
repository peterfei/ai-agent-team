import { ToolDefinition, ToolInvocation } from '../types';
import { ThreadManager } from '../core/thread-manager';

export const toolDefinition: ToolDefinition = {
  name: 'get_thread',
  description: 'Get detailed information about a specific thread, optionally including messages and file changes.',
  inputSchema: {
    type: 'object',
    properties: {
      threadId: {
        type: 'string',
        description: 'ID of the thread to retrieve'
      },
      includeMessages: {
        type: 'boolean',
        description: 'Include message history (default: false)'
      },
      includeFileChanges: {
        type: 'boolean',
        description: 'Include file change history (default: false)'
      },
      messageLimit: {
        type: 'number',
        description: 'Limit number of messages returned if included (default: 50)'
      }
    },
    required: ['threadId']
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
  const { threadId, includeMessages, includeFileChanges, messageLimit } = invocation.input as any;
  return await threadManager.getThread(threadId, includeMessages, includeFileChanges, messageLimit);
};
