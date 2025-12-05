import simpleGit, { SimpleGit, DiffResult } from 'simple-git';
import path from 'path';
import fs from 'fs-extra';

export interface DiffStats {
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  fileStats: Record<string, { added: number; deleted: number; changeType: 'added' | 'modified' | 'deleted' }>;
}

export class GitIntegration {
  private git: SimpleGit;
  private rootDir: string;

  constructor(rootDir?: string) {
    this.rootDir = rootDir || process.cwd();
    this.git = simpleGit(this.rootDir);
  }

  public async isGitRepo(): Promise<boolean> {
    try {
      return await this.git.checkIsRepo();
    } catch (e) {
      return false;
    }
  }

  public async getCurrentCommit(): Promise<string | undefined> {
    try {
      const log = await this.git.log({ maxCount: 1 });
      return log.latest?.hash;
    } catch (e) {
      return undefined;
    }
  }

  public async getUnstagedDiff(filePath?: string): Promise<string> {
    try {
      const options = filePath ? [filePath] : [];
      return await this.git.diff(options);
    } catch (e) {
      console.error('Error getting unstaged diff:', e);
      return '';
    }
  }

  public async getStagedDiff(filePath?: string): Promise<string> {
    try {
      const options = ['--cached'];
      if (filePath) options.push(filePath);
      return await this.git.diff(options);
    } catch (e) {
      console.error('Error getting staged diff:', e);
      return '';
    }
  }

  /**
   * Get stats for a specific file based on its current state on disk vs HEAD
   * This includes both staged and unstaged changes.
   */
  public async getFileStats(filePath: string): Promise<{ added: number; deleted: number; changeType: 'added' | 'modified' | 'deleted' }> {
    try {
      // Use git diff --numstat HEAD -- filePath
      // This compares working directory (and stage) against HEAD
      const raw = await this.git.raw(['diff', '--numstat', 'HEAD', '--', filePath]);
      
      if (!raw.trim()) {
        // If no output, maybe it's a new untracked file?
        const status = await this.git.status();
        const isUntracked = status.not_added.includes(filePath);
        if (isUntracked) {
           // For untracked files, count all lines as added
           try {
             const content = await fs.readFile(path.resolve(this.rootDir, filePath), 'utf-8');
             const lines = content.split('\n').length;
             return { added: lines, deleted: 0, changeType: 'added' };
           } catch (e) {
             return { added: 0, deleted: 0, changeType: 'modified' }; // Should not happen if file exists
           }
        }
        return { added: 0, deleted: 0, changeType: 'modified' };
      }

      const parts = raw.trim().split(/\s+/);
      if (parts.length >= 2) {
        const added = parseInt(parts[0], 10) || 0;
        const deleted = parseInt(parts[1], 10) || 0;
        
        // Determine change type
        // This is a simplification. 'added' usually means new file, 'deleted' means file removed.
        // git diff --numstat doesn't explicitly say 'new file'.
        // We can check git status for more precision if needed.
        let changeType: 'added' | 'modified' | 'deleted' = 'modified';
        
        // Check status for better type determination
        const status = await this.git.status();
        if (status.created.includes(filePath) || status.not_added.includes(filePath)) {
            changeType = 'added';
        } else if (status.deleted.includes(filePath)) {
            changeType = 'deleted';
        }

        return { added, deleted, changeType };
      }

      return { added: 0, deleted: 0, changeType: 'modified' };
    } catch (e) {
      console.error(`Error getting file stats for ${filePath}:`, e);
      return { added: 0, deleted: 0, changeType: 'modified' };
    }
  }

  /**
   * Parse a unified diff string to count lines (fallback if numstat isn't enough)
   */
  public parseDiff(diff: string): { added: number, deleted: number } {
    let added = 0;
    let deleted = 0;
    
    const lines = diff.split('\n');
    for (const line of lines) {
      if (line.startsWith('+++') || line.startsWith('---')) continue;
      if (line.startsWith('+')) added++;
      if (line.startsWith('-')) deleted++;
    }
    
    return { added, deleted };
  }

  /**
   * Get current branch name
   */
  public async getCurrentBranch(): Promise<string | null> {
    try {
      const result = await this.git.branch();
      return result.current;
    } catch (e) {
      return null;
    }
  }

  /**
   * Create and checkout a new branch
   */
  public async createAndCheckoutBranch(branchName: string): Promise<boolean> {
    try {
      await this.git.checkoutLocalBranch(branchName);
      return true;
    } catch (e) {
      console.error('Error creating branch:', e);
      return false;
    }
  }

  /**
   * Checkout an existing branch
   */
  public async checkoutBranch(branchName: string): Promise<boolean> {
    try {
      await this.git.checkout(branchName);
      return true;
    } catch (e) {
      console.error('Error checking out branch:', e);
      return false;
    }
  }

  /**
   * Check if branch exists
   */
  public async branchExists(branchName: string): Promise<boolean> {
    try {
      const branches = await this.git.branch();
      return branches.all.includes(branchName);
    } catch (e) {
      return false;
    }
  }

  /**
   * Delete a branch
   */
  public async deleteBranch(
    branchName: string,
    force: boolean = false
  ): Promise<boolean> {
    try {
      await this.git.branch([force ? '-D' : '-d', branchName]);
      return true;
    } catch (e) {
      console.error('Error deleting branch:', e);
      return false;
    }
  }
}
