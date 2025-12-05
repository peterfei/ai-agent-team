import { ToolDefinition, ToolInvocation } from '../types';
import { ThreadManager } from '../core/thread-manager';

export const toolDefinition: ToolDefinition = {
  name: 'add_message',
  description: 'Add a message to the current active thread. Use this to record conversation messages.',
  inputSchema: {
    type: 'object',
    properties: {
      role: {
        type: 'string',
        enum: ['user', 'assistant', 'system'],
        description: 'The role of the message sender'
      },
      content: {
        type: 'string',
        description: 'The content of the message'
      },
      metadata: {
        type: 'object',
        description: 'Optional metadata for the message (e.g., timestamp, tags, etc.)'
      }
    },
    required: ['role', 'content']
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
    const { role, content, metadata } = invocation.input as any;

    const current = await threadManager.getCurrentThread();
    if (!current.thread) {
        return { success: false, message: "No active thread to add message to." };
    }

    try {
        const message = await threadManager.addMessageToThread(
            current.thread.id,
            role,
            content,
            metadata
        );
        return {
            success: true,
            message: message,
            info: `Message added to thread "${current.thread.title}".`
        };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};
