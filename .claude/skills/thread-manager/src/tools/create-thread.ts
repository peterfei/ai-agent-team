import { ToolDefinition, ToolInvocation } from '../types';
import { ThreadManager } from '../core/thread-manager';
import { CreateThreadInput } from '../types';

export const toolDefinition: ToolDefinition = {
  name: 'create_thread',
  description: 'Create a new conversation thread to isolate context for a specific task.',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Title of the thread (e.g., "Implement User Auth", "Fix Bug #123")'
      },
      description: {
        type: 'string',
        description: 'Optional detailed description of the task'
      },
      switchTo: {
        type: 'boolean',
        description: 'Whether to switch to this thread immediately (default: true)'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags for categorization (e.g., "frontend", "bugfix")'
      }
    },
    required: ['title']
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
  const input = invocation.input as CreateThreadInput;
  // Default switchTo to true if not provided, consistent with command behavior
  if (input.switchTo === undefined) {
      input.switchTo = true;
  }
  
  return await threadManager.createThread(input);
};
