import { ToolDefinition, ToolInvocation } from '../types';
import { ThreadManager } from '../core/thread-manager';
import { ListThreadsInput } from '../types';

export const toolDefinition: ToolDefinition = {
  name: 'list_threads',
  description: 'List all conversation threads with filtering and sorting options.',
  inputSchema: {
    type: 'object',
    properties: {
      sortBy: {
        type: 'string',
        enum: ['updatedAt', 'createdAt', 'messageCount'],
        description: 'Field to sort by (default: updatedAt)'
      },
      order: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort order (default: desc)'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter threads by tags'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of threads to return (default: 50)'
      },
      offset: {
        type: 'number',
        description: 'Pagination offset'
      }
    }
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
  const input = invocation.input as ListThreadsInput;
  return await threadManager.listThreads(input);
};
