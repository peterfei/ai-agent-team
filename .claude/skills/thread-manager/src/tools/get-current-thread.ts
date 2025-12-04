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
  return await threadManager.getCurrentThread(includeMessages, includeFileChanges);
};
