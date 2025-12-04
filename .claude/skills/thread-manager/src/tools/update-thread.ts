import { ToolDefinition, ToolInvocation } from '../types';
import { ThreadManager } from '../core/thread-manager';
import { UpdateThreadInput } from '../types';

export const toolDefinition: ToolDefinition = {
  name: 'update_thread',
  description: 'Update the metadata (title, description, tags) of a thread.',
  inputSchema: {
    type: 'object',
    properties: {
      threadId: {
        type: 'string',
        description: 'ID of the thread to update'
      },
      title: {
        type: 'string',
        description: 'New title'
      },
      description: {
        type: 'string',
        description: 'New description'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'New list of tags (replaces existing tags)'
      }
    },
    required: ['threadId']
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
  const input = invocation.input as UpdateThreadInput;
  // Separate threadId for the first argument, but pass the full input as the second argument
  // because UpdateThreadInput requires threadId.
  return await threadManager.updateThread(input.threadId, input);
};
