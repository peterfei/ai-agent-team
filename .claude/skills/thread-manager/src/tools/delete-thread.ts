import { ToolDefinition, ToolInvocation } from '../types';
import { ThreadManager } from '../core/thread-manager';

export const toolDefinition: ToolDefinition = {
  name: 'delete_thread',
  description: 'Delete a thread and all associated data permanently.',
  inputSchema: {
    type: 'object',
    properties: {
      threadId: {
        type: 'string',
        description: 'ID of the thread to delete'
      },
      confirm: {
        type: 'boolean',
        description: 'Must be set to true to confirm deletion'
      }
    },
    required: ['threadId', 'confirm']
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
  const { threadId, confirm } = invocation.input as any;
  
  if (confirm !== true) {
      return { success: false, message: "Deletion not confirmed. Please set 'confirm' to true." };
  }

  return await threadManager.deleteThread(threadId);
};
