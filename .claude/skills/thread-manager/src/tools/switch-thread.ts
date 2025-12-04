import { ToolDefinition, ToolInvocation } from '../types';
import { ThreadManager } from '../core/thread-manager';
import { SwitchThreadInput } from '../types';
import { validate as isUuid } from 'uuid';

export const toolDefinition: ToolDefinition = {
  name: 'switch_thread',
  description: 'Switch the active context to a specific thread.',
  inputSchema: {
    type: 'object',
    properties: {
      threadId: {
        type: 'string',
        description: 'ID of the thread to switch to (can be full UUID or a unique prefix)'
      }
    },
    required: ['threadId']
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
  const input = invocation.input as SwitchThreadInput;
  let { threadId } = input;

  // If threadId is not a full UUID, try to resolve it from prefix
  if (!isUuid(threadId)) {
    const matchingThreads = threadManager.findThreadsByPrefix(threadId);

    if (matchingThreads.length === 0) {
      return { success: false, message: `No thread found matching prefix "${threadId}".` };
    } else if (matchingThreads.length > 1) {
      const matches = matchingThreads.map(t => `${t.title} (${t.id.substring(0, 8)})`).join(', ');
      return { success: false, message: `Multiple threads match "${threadId}": ${matches}. Please provide a more specific ID.` };
    } else {
      threadId = matchingThreads[0].id; // Use the full ID
    }
  }

  return await threadManager.switchThread(threadId);
};
