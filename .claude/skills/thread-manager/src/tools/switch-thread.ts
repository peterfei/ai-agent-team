import { ToolDefinition, ToolInvocation } from '@modelcontextprotocol/sdk/types.js';
import { ThreadManager } from '../core/thread-manager';
import { SwitchThreadInput } from '../types';

export const toolDefinition: ToolDefinition = {
  name: 'switch_thread',
  description: 'Switch the active context to a specific thread.',
  inputSchema: {
    type: 'object',
    properties: {
      threadId: {
        type: 'string',
        description: 'ID of the thread to switch to'
      },
      saveCurrentContext: {
        type: 'boolean',
        description: 'Whether to save the current context before switching (default: true)'
      }
    },
    required: ['threadId']
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
  const input = invocation.input as SwitchThreadInput;
  return await threadManager.switchThread(input.threadId, input.saveCurrentContext);
};
