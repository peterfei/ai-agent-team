import { DatabaseManager, ThreadsDAO, MessagesDAO, FileChangesDAO } from '../database';
import { GitIntegration } from '../git/git-integration';
import { Thread, Message, FileChange, CreateThreadInput, ListThreadsInput, UpdateThreadInput } from '../types';

export class ThreadManager {
  private dbManager: DatabaseManager;
  private threadsDAO: ThreadsDAO;
  private messagesDAO: MessagesDAO;
  private fileChangesDAO: FileChangesDAO;
  private gitIntegration: GitIntegration;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
    this.threadsDAO = new ThreadsDAO(dbManager);
    this.messagesDAO = new MessagesDAO(dbManager);
    this.fileChangesDAO = new FileChangesDAO(dbManager);
    this.gitIntegration = new GitIntegration();
  }

  public async createThread(input: CreateThreadInput): Promise<{ thread: Thread, message: string }> {
    const { title, description, switchTo = true, tags } = input;

    // Deactivate current active thread if switchTo is true
    if (switchTo) {
      const currentActive = this.threadsDAO.getActive();
      if (currentActive) {
        this.threadsDAO.update(currentActive.id, { isActive: false });
      }
    }

    const newThread = this.threadsDAO.create({
      title,
      description,
      isActive: switchTo,
      metadata: {
        filesChanged: 0,
        linesAdded: 0,
        linesDeleted: 0,
        tags: tags || []
      }
    });

    return {
      thread: newThread,
      message: `Thread "${newThread.title}" (${newThread.id}) created successfully.`
    };
  }

  public async getThread(id: string, includeMessages: boolean = false, includeFileChanges: boolean = false, messageLimit: number = 50): Promise<{ thread: Thread | null, messages?: Message[], fileChanges?: FileChange[] }> {
    const thread = this.threadsDAO.findById(id);
    if (!thread) {
      return { thread: null };
    }

    let messages: Message[] | undefined;
    if (includeMessages) {
      messages = this.messagesDAO.findByThreadId(id, { limit: messageLimit });
    }

    let fileChanges: FileChange[] | undefined;
    if (includeFileChanges) {
      fileChanges = this.fileChangesDAO.findByThreadId(id);
    }

    return { thread, messages, fileChanges };
  }

  public async listThreads(input: ListThreadsInput): Promise<{ threads: Thread[], total: number, currentThreadId?: string }> {
    const { threads, total } = this.threadsDAO.findAll(input);
    const currentActive = this.threadsDAO.getActive();

    return {
      threads,
      total,
      currentThreadId: currentActive?.id
    };
  }

  public async updateThread(id: string, updates: UpdateThreadInput): Promise<{ success: boolean, thread?: Thread, message: string }> {
    const existingThread = this.threadsDAO.findById(id);
    if (!existingThread) {
      return { success: false, message: `Thread with ID ${id} not found.` };
    }

    // Map UpdateThreadInput to Partial<Thread>
    const threadUpdates: Partial<Thread> = {
        title: updates.title,
        description: updates.description,
    };

    if (updates.tags) {
        threadUpdates.metadata = {
            ...existingThread.metadata,
            tags: updates.tags
        };
    }

    const updatedThread = this.threadsDAO.update(id, threadUpdates);
    if (!updatedThread) {
      return { success: false, message: `Failed to update thread with ID ${id}.` };
    }

    return { success: true, thread: updatedThread, message: `Thread "${updatedThread.title}" (${updatedThread.id}) updated successfully.` };
  }

  public async deleteThread(id: string): Promise<{ success: boolean, message: string }> {
    // Check if it's the active thread
    const currentActive = this.threadsDAO.getActive();
    if (currentActive?.id === id) {
      return { success: false, message: "Cannot delete the currently active thread. Please switch to another thread first." };
    }
    
    const deleted = this.threadsDAO.delete(id);
    if (!deleted) {
      return { success: false, message: `Thread with ID ${id} not found or failed to delete.` };
    }

    // Due to ON DELETE CASCADE in SQLite schema, messages and file_changes are automatically deleted.
    return { success: true, message: `Thread with ID ${id} deleted successfully.` };
  }

  public async switchThread(id: string, saveCurrentContext: boolean = true): Promise<{ success: boolean, thread?: Thread, messages?: Message[], message: string }> {
    const targetThread = this.threadsDAO.findById(id);
    if (!targetThread) {
      return { success: false, message: `Thread with ID ${id} not found.` };
    }

    // If already active, do nothing and return success
    if (targetThread.isActive) {
      const messages = this.messagesDAO.findByThreadId(id, { limit: 50 });
      return { success: true, thread: targetThread, messages, message: `Already on thread "${targetThread.title}" (${targetThread.id}).` };
    }

    // Save current context is implicitly handled by not touching the existing messages in MessagesDAO
    // The `isActive` flag handles the context switching for the manager itself.

    const activated = this.threadsDAO.setActive(id);
    if (!activated) {
      return { success: false, message: `Failed to switch to thread with ID ${id}.` };
    }

    const messages = this.messagesDAO.findByThreadId(id, { limit: 50 }); // Load recent messages

    return { success: true, thread: { ...targetThread, isActive: true }, messages, message: `Switched to thread "${targetThread.title}" (${targetThread.id}).` };
  }

  public async getCurrentThread(includeMessages: boolean = false, includeFileChanges: boolean = false, messageLimit: number = 50): Promise<{ thread?: Thread, messages?: Message[], fileChanges?: FileChange[], message?: string }> {
    const activeThread = this.threadsDAO.getActive();
    if (!activeThread) {
      return { message: "No active thread found." };
    }

    const { thread, messages, fileChanges } = await this.getThread(activeThread.id, includeMessages, includeFileChanges, messageLimit);
    if (!thread) {
      return { message: "Active thread not found in database (unexpected)." }; // Should not happen if getActive returns one
    }
    return { thread, messages, fileChanges };
  }

  public async addMessageToThread(threadId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>): Promise<Message> {
    // Ensure thread exists and is active (or specified threadId is the active one)
    const activeThread = this.threadsDAO.getActive();
    if (!activeThread || activeThread.id !== threadId) {
      throw new Error(`Thread with ID ${threadId} is not the active thread or does not exist. Cannot add message.`);
    }

    const message = this.messagesDAO.create({ threadId, role, content, metadata });
    return message;
  }

  public async trackFileChange(threadId: string, filePath: string, changeType?: 'added' | 'modified' | 'deleted', linesAdded?: number, linesDeleted?: number, gitCommit?: string): Promise<FileChange> {
    // Ensure thread exists and is active
    const activeThread = this.threadsDAO.getActive();
    if (!activeThread || activeThread.id !== threadId) {
      throw new Error(`Thread with ID ${threadId} is not the active thread or does not exist. Cannot track file change.`);
    }

    // Auto-detect stats if not provided
    if (linesAdded === undefined || linesDeleted === undefined || changeType === undefined) {
        const stats = await this.gitIntegration.getFileStats(filePath);
        if (linesAdded === undefined) linesAdded = stats.added;
        if (linesDeleted === undefined) linesDeleted = stats.deleted;
        if (changeType === undefined) changeType = stats.changeType;
    }

    // Auto-detect commit hash if not provided
    if (!gitCommit) {
        gitCommit = await this.gitIntegration.getCurrentCommit();
    }

    const fileChange = this.fileChangesDAO.create({ 
        threadId, 
        filePath, 
        changeType: changeType!, 
        linesAdded, 
        linesDeleted, 
        gitCommit 
    });
    return fileChange;
  }
}
