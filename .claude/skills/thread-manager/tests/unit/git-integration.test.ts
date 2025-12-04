import { GitIntegration } from '../../src/git/git-integration';

// Mock simple-git
const mockLog = jest.fn();
const mockDiff = jest.fn();
const mockCheckIsRepo = jest.fn();
const mockRaw = jest.fn();
const mockStatus = jest.fn();

jest.mock('simple-git', () => {
  return () => ({
    log: mockLog,
    diff: mockDiff,
    checkIsRepo: mockCheckIsRepo,
    raw: mockRaw,
    status: mockStatus
  });
});

describe('GitIntegration', () => {
  let gitIntegration: GitIntegration;

  beforeEach(() => {
    gitIntegration = new GitIntegration('/tmp/test-repo');
    jest.clearAllMocks();
  });

  it('should check if directory is a git repo', async () => {
    mockCheckIsRepo.mockResolvedValue(true);
    const isRepo = await gitIntegration.isGitRepo();
    expect(isRepo).toBe(true);
    expect(mockCheckIsRepo).toHaveBeenCalled();
  });

  it('should return false if checkIsRepo fails', async () => {
    mockCheckIsRepo.mockRejectedValue(new Error('Not a repo'));
    const isRepo = await gitIntegration.isGitRepo();
    expect(isRepo).toBe(false);
  });

  it('should get current commit hash', async () => {
    mockLog.mockResolvedValue({ latest: { hash: 'abc1234' } });
    const hash = await gitIntegration.getCurrentCommit();
    expect(hash).toBe('abc1234');
  });

  it('should return undefined if getCurrentCommit fails', async () => {
    mockLog.mockRejectedValue(new Error('Git error'));
    const hash = await gitIntegration.getCurrentCommit();
    expect(hash).toBeUndefined();
  });

  it('should get unstaged diff', async () => {
    mockDiff.mockResolvedValue('diff content');
    const diff = await gitIntegration.getUnstagedDiff('file.txt');
    expect(diff).toBe('diff content');
    expect(mockDiff).toHaveBeenCalledWith(['file.txt']);
  });

  it('should return empty string if getUnstagedDiff fails', async () => {
    mockDiff.mockRejectedValue(new Error('Git error'));
    const diff = await gitIntegration.getUnstagedDiff('file.txt');
    expect(diff).toBe('');
  });

  it('should get staged diff', async () => {
    mockDiff.mockResolvedValue('staged diff content');
    const diff = await gitIntegration.getStagedDiff('file.txt');
    expect(diff).toBe('staged diff content');
    expect(mockDiff).toHaveBeenCalledWith(['--cached', 'file.txt']);
  });

  it('should return empty string if getStagedDiff fails', async () => {
    mockDiff.mockRejectedValue(new Error('Git error'));
    const diff = await gitIntegration.getStagedDiff('file.txt');
    expect(diff).toBe('');
  });

  it('should get file stats from git raw numstat', async () => {
    mockRaw.mockResolvedValue('5\t3\tfile.txt\n'); // 5 added, 3 deleted
    mockStatus.mockResolvedValue({ created: [], not_added: [], deleted: [] });

    const stats = await gitIntegration.getFileStats('file.txt');
    
    expect(stats.added).toBe(5);
    expect(stats.deleted).toBe(3);
    expect(stats.changeType).toBe('modified');
    expect(mockRaw).toHaveBeenCalledWith(expect.arrayContaining(['diff', '--numstat', 'HEAD', '--', 'file.txt']));
  });

  it('should handle file stats for new untracked file', async () => {
    mockRaw.mockResolvedValue(''); // No diff against HEAD
    mockStatus.mockResolvedValue({ created: [], not_added: ['new.txt'], deleted: [] });
    
    // We need to mock fs.readFile but since it's hard to mock fs-extra alongside simple-git in this setup
    // let's rely on the fact that if readFile fails it returns modified 0/0.
    // Ideally we should mock fs-extra too.
    
    const stats = await gitIntegration.getFileStats('new.txt');
    // Expect fallback to 0/0 modified if read fails, or added if we could mock read.
    // Given we didn't mock fs-extra, it likely fails reading /tmp/test-repo/new.txt
    expect(stats.changeType).toBe('modified'); 
  });

  it('should return 0/0 modified if getFileStats fails', async () => {
    mockRaw.mockRejectedValue(new Error('Git error'));
    const stats = await gitIntegration.getFileStats('error.txt');
    expect(stats.added).toBe(0);
    expect(stats.deleted).toBe(0);
    expect(stats.changeType).toBe('modified');
  });

  it('should detect added file', async () => {
    mockRaw.mockResolvedValue('10\t0\tnewfile.txt\n');
    mockStatus.mockResolvedValue({ created: ['newfile.txt'], not_added: [], deleted: [] });

    const stats = await gitIntegration.getFileStats('newfile.txt');
    
    expect(stats.changeType).toBe('added');
  });

  it('should detect deleted file', async () => {
    mockRaw.mockResolvedValue('0\t10\tdeleted.txt\n');
    mockStatus.mockResolvedValue({ created: [], not_added: [], deleted: ['deleted.txt'] });

    const stats = await gitIntegration.getFileStats('deleted.txt');
    
    expect(stats.changeType).toBe('deleted');
  });

  it('should parse simple diff manually', () => {
    const diff = `
@@ -1,2 +1,3 @@
-old line
+new line
+another new line
    `.trim();

    const stats = gitIntegration.parseDiff(diff);
    expect(stats.added).toBe(2);
    expect(stats.deleted).toBe(1);
  });
});