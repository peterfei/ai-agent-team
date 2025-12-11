// ==================== Core Entity Types ====================

/**
 * Thread Entity
 */
export interface Thread {
  id: string;                    // UUID
  sessionId: string;             // Session ID (usually same as ID)
  title: string;                 // Title
  description?: string;          // Description
  gitBranch?: string;            // Associated Git branch
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Update timestamp
  messageCount: number;          // Number of messages
  isActive: boolean;             // Is current active thread
  metadata: ThreadMetadata;      // Metadata
}

/**
 * Thread Metadata
 */
export interface ThreadMetadata {
  filesChanged: number;          // Number of files changed
  linesAdded: number;            // Lines added
  linesDeleted: number;          // Lines deleted
  tags?: string[];               // Tags
}

/**
 * Message Entity
 */
export interface Message {
  id: string;                    // UUID
  threadId: string;              // Thread ID
  role: 'user' | 'assistant' | 'system';
  content: string;               // Message content
  timestamp: Date;               // Timestamp
  metadata?: Record<string, any>;
  embedding?: number[];          // Vector embedding
}

/**
 * FileChange Entity
 */
export interface FileChange {
  id: string;                    // UUID
  threadId: string;              // Thread ID
  filePath: string;              // File path
  changeType: 'added' | 'modified' | 'deleted';
  linesAdded: number;            // Lines added
  linesDeleted: number;          // Lines deleted
  timestamp: Date;               // Timestamp
  gitCommit?: string;            // Git commit hash
}

// ==================== Tool Input/Output Types ====================

export interface CreateThreadInput {
  title: string;
  description?: string;
  switchTo?: boolean;            // Default true
  tags?: string[];
}

export interface ListThreadsInput {
  sortBy?: 'updatedAt' | 'createdAt' | 'messageCount';
  order?: 'asc' | 'desc';
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface SwitchThreadInput {
  threadId: string;
  saveCurrentContext?: boolean;  // Default true
}

export interface UpdateThreadInput {
  threadId: string;
  title?: string;
  description?: string;
  gitBranch?: string;
  tags?: string[];
}

// ==================== SDK Types Replacement ====================

export interface ToolDefinition {
  name: string;
  description?: string;
  inputSchema: any; // JSON Schema
}

export interface ToolInvocation {
  toolName: string;
  input: any;
}
