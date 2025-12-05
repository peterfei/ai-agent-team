import { ToolDefinition, ToolInvocation } from '../types';
import { ThreadManager } from '../core/thread-manager';

export const toolDefinition: ToolDefinition = {
  name: 'track_file_change',
  description: 'Record a file change event for the current active thread. If stats are not provided, they will be auto-detected from git.',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path of the changed file relative to project root'
      },
      changeType: {
        type: 'string',
        enum: ['added', 'modified', 'deleted'],
        description: 'Type of change (optional, auto-detected if omitted)'
      },
      linesAdded: {
          type: 'number',
          description: 'Number of lines added (optional, auto-detected if omitted)'
      },
      linesDeleted: {
          type: 'number',
          description: 'Number of lines deleted (optional, auto-detected if omitted)'
      }
    },
    required: ['filePath']
  }
};

export const toolHandler = async (invocation: ToolInvocation, threadManager: ThreadManager) => {
    const { filePath, changeType, linesAdded, linesDeleted } = invocation.input as any;
    
    const current = await threadManager.getCurrentThread();
    if (!current.thread) {
        return { success: false, message: "No active thread to track file change against." };
    }

    try {
        const result = await threadManager.trackFileChange(
            current.thread.id,
            filePath,
            changeType,
            linesAdded,
            linesDeleted
        );
        return { success: true, fileChange: result, message: "File change tracked." };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};
