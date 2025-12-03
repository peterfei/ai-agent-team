const GitHubIntegration = require('../../src/integrations/GitHubIntegration');

// Mock Octokit
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      pulls: {
        get: jest.fn()
      },
      repos: {
        createRelease: jest.fn(),
        updateRelease: jest.fn(),
        getReleaseByTag: jest.fn(),
        get: jest.fn(),
        listPullRequestsAssociatedWithCommit: jest.fn()
      },
      users: {
        getAuthenticated: jest.fn()
      }
    }))
  };
});

describe('GitHubIntegration', () => {
  let github;
  let mockOctokit;

  beforeEach(() => {
    jest.clearAllMocks();

    const config = {
      token: 'test-token',
      owner: 'test-owner',
      repo: 'test-repo'
    };

    github = new GitHubIntegration(config);
    mockOctokit = github.octokit;
  });

  describe('Constructor', () => {
    test('should initialize with config', () => {
      expect(github.owner).toBe('test-owner');
      expect(github.repo).toBe('test-repo');
    });

    test('should use token from config', () => {
      const config = {
        token: 'my-token',
        owner: 'owner',
        repo: 'repo'
      };

      const gh = new GitHubIntegration(config);
      expect(gh.config.token).toBe('my-token');
    });

    test('should use GITHUB_TOKEN from env if not provided', () => {
      process.env.GITHUB_TOKEN = 'env-token';

      const config = {
        owner: 'owner',
        repo: 'repo'
      };

      const gh = new GitHubIntegration(config);
      // Octokit should be initialized (we can't directly test the token)
      expect(gh.octokit).toBeDefined();

      delete process.env.GITHUB_TOKEN;
    });
  });

  describe('getPRInfo', () => {
    test('should fetch PR information', async () => {
      const mockPRData = {
        data: {
          number: 42,
          title: 'Test PR',
          body: 'PR description',
          labels: [{ name: 'feature' }, { name: 'enhancement' }],
          user: {
            login: 'test-user',
            html_url: 'https://github.com/test-user'
          },
          merged_at: '2025-12-03T10:30:00Z',
          html_url: 'https://github.com/test-owner/test-repo/pull/42',
          state: 'closed',
          merged: true
        }
      };

      mockOctokit.pulls.get.mockResolvedValue(mockPRData);

      const result = await github.getPRInfo(42);

      expect(mockOctokit.pulls.get).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 42
      });

      expect(result).toEqual({
        number: 42,
        title: 'Test PR',
        body: 'PR description',
        labels: ['feature', 'enhancement'],
        author: 'test-user',
        authorUrl: 'https://github.com/test-user',
        mergedAt: '2025-12-03T10:30:00Z',
        url: 'https://github.com/test-owner/test-repo/pull/42',
        state: 'closed',
        merged: true
      });
    });

    test('should return null on error', async () => {
      mockOctokit.pulls.get.mockRejectedValue(new Error('Not found'));

      const result = await github.getPRInfo(999);

      expect(result).toBeNull();
    });
  });

  describe('getPRInfoBatch', () => {
    test('should fetch multiple PRs', async () => {
      const mockPR1 = {
        data: {
          number: 1,
          title: 'PR 1',
          body: '',
          labels: [],
          user: { login: 'user1', html_url: 'https://github.com/user1' },
          merged_at: null,
          html_url: 'https://github.com/test-owner/test-repo/pull/1',
          state: 'open',
          merged: false
        }
      };

      const mockPR2 = {
        data: {
          number: 2,
          title: 'PR 2',
          body: '',
          labels: [],
          user: { login: 'user2', html_url: 'https://github.com/user2' },
          merged_at: null,
          html_url: 'https://github.com/test-owner/test-repo/pull/2',
          state: 'open',
          merged: false
        }
      };

      mockOctokit.pulls.get
        .mockResolvedValueOnce(mockPR1)
        .mockResolvedValueOnce(mockPR2);

      const result = await github.getPRInfoBatch([1, 2]);

      expect(result.size).toBe(2);
      expect(result.get(1).title).toBe('PR 1');
      expect(result.get(2).title).toBe('PR 2');
    });

    test('should skip failed PRs', async () => {
      mockOctokit.pulls.get
        .mockResolvedValueOnce({
          data: {
            number: 1,
            title: 'PR 1',
            body: '',
            labels: [],
            user: { login: 'user1', html_url: 'https://github.com/user1' },
            merged_at: null,
            html_url: 'https://github.com/test-owner/test-repo/pull/1',
            state: 'open',
            merged: false
          }
        })
        .mockRejectedValueOnce(new Error('Not found'));

      const result = await github.getPRInfoBatch([1, 2]);

      expect(result.size).toBe(1);
      expect(result.get(1)).toBeDefined();
      expect(result.get(2)).toBeUndefined();
    });
  });

  describe('createRelease', () => {
    test('should create release', async () => {
      const mockReleaseData = {
        data: {
          id: 123,
          html_url: 'https://github.com/test-owner/test-repo/releases/tag/v1.0.0',
          upload_url: 'https://uploads.github.com/...',
          tag_name: 'v1.0.0'
        }
      };

      mockOctokit.repos.createRelease.mockResolvedValue(mockReleaseData);

      const result = await github.createRelease({
        tagName: 'v1.0.0',
        name: 'Release 1.0.0',
        body: '## Changes\n- Feature 1\n- Fix 1',
        draft: false,
        prerelease: false
      });

      expect(mockOctokit.repos.createRelease).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        tag_name: 'v1.0.0',
        name: 'Release 1.0.0',
        body: '## Changes\n- Feature 1\n- Fix 1',
        draft: false,
        prerelease: false
      });

      expect(result).toEqual({
        id: 123,
        url: 'https://github.com/test-owner/test-repo/releases/tag/v1.0.0',
        uploadUrl: 'https://uploads.github.com/...',
        tagName: 'v1.0.0'
      });
    });

    test('should throw error on failure', async () => {
      mockOctokit.repos.createRelease.mockRejectedValue(new Error('API error'));

      await expect(
        github.createRelease({
          tagName: 'v1.0.0',
          name: 'Release 1.0.0',
          body: 'Release notes'
        })
      ).rejects.toThrow('Failed to create GitHub Release');
    });
  });

  describe('updateRelease', () => {
    test('should update release', async () => {
      const mockUpdateData = {
        data: {
          id: 123,
          html_url: 'https://github.com/test-owner/test-repo/releases/tag/v1.0.0',
          tag_name: 'v1.0.0'
        }
      };

      mockOctokit.repos.updateRelease.mockResolvedValue(mockUpdateData);

      const result = await github.updateRelease(123, {
        body: 'Updated release notes',
        draft: false
      });

      expect(mockOctokit.repos.updateRelease).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        release_id: 123,
        body: 'Updated release notes',
        draft: false
      });

      expect(result.id).toBe(123);
    });
  });

  describe('getReleaseByTag', () => {
    test('should get release by tag', async () => {
      const mockReleaseData = {
        data: {
          id: 123,
          html_url: 'https://github.com/test-owner/test-repo/releases/tag/v1.0.0',
          tag_name: 'v1.0.0',
          name: 'Release 1.0.0',
          body: 'Release notes'
        }
      };

      mockOctokit.repos.getReleaseByTag.mockResolvedValue(mockReleaseData);

      const result = await github.getReleaseByTag('v1.0.0');

      expect(result).toEqual({
        id: 123,
        url: 'https://github.com/test-owner/test-repo/releases/tag/v1.0.0',
        tagName: 'v1.0.0',
        name: 'Release 1.0.0',
        body: 'Release notes'
      });
    });

    test('should return null for 404 error', async () => {
      const error = new Error('Not found');
      error.status = 404;
      mockOctokit.repos.getReleaseByTag.mockRejectedValue(error);

      const result = await github.getReleaseByTag('v999.0.0');

      expect(result).toBeNull();
    });

    test('should throw other errors', async () => {
      mockOctokit.repos.getReleaseByTag.mockRejectedValue(new Error('API error'));

      await expect(
        github.getReleaseByTag('v1.0.0')
      ).rejects.toThrow('API error');
    });
  });

  describe('getRepoInfo', () => {
    test('should get repository information', async () => {
      const mockRepoData = {
        data: {
          name: 'test-repo',
          full_name: 'test-owner/test-repo',
          description: 'Test repository',
          html_url: 'https://github.com/test-owner/test-repo',
          default_branch: 'main'
        }
      };

      mockOctokit.repos.get.mockResolvedValue(mockRepoData);

      const result = await github.getRepoInfo();

      expect(result).toEqual({
        name: 'test-repo',
        fullName: 'test-owner/test-repo',
        description: 'Test repository',
        url: 'https://github.com/test-owner/test-repo',
        defaultBranch: 'main'
      });
    });
  });

  describe('getCommitPRs', () => {
    test('should get PRs associated with commit', async () => {
      const mockPRsData = {
        data: [
          { number: 42 },
          { number: 43 }
        ]
      };

      mockOctokit.repos.listPullRequestsAssociatedWithCommit.mockResolvedValue(mockPRsData);

      const result = await github.getCommitPRs('abc123');

      expect(result).toEqual([42, 43]);
    });

    test('should return empty array on error', async () => {
      mockOctokit.repos.listPullRequestsAssociatedWithCommit.mockRejectedValue(
        new Error('Not found')
      );

      const result = await github.getCommitPRs('invalid-sha');

      expect(result).toEqual([]);
    });
  });

  describe('validateToken', () => {
    test('should return true for valid token', async () => {
      mockOctokit.users.getAuthenticated.mockResolvedValue({ data: {} });

      const result = await github.validateToken();

      expect(result).toBe(true);
    });

    test('should return false for invalid token', async () => {
      mockOctokit.users.getAuthenticated.mockRejectedValue(new Error('Unauthorized'));

      const result = await github.validateToken();

      expect(result).toBe(false);
    });
  });

  describe('parseRepoUrl (static)', () => {
    test('should parse HTTPS URL', () => {
      const result = GitHubIntegration.parseRepoUrl(
        'https://github.com/owner/repo.git'
      );

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo'
      });
    });

    test('should parse HTTPS URL without .git', () => {
      const result = GitHubIntegration.parseRepoUrl(
        'https://github.com/owner/repo'
      );

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo'
      });
    });

    test('should parse SSH URL', () => {
      const result = GitHubIntegration.parseRepoUrl(
        'git@github.com:owner/repo.git'
      );

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo'
      });
    });

    test('should parse SSH URL without .git', () => {
      const result = GitHubIntegration.parseRepoUrl(
        'git@github.com:owner/repo'
      );

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo'
      });
    });

    test('should return null for invalid URL', () => {
      const result = GitHubIntegration.parseRepoUrl('invalid-url');

      expect(result).toBeNull();
    });

    test('should return null for null URL', () => {
      const result = GitHubIntegration.parseRepoUrl(null);

      expect(result).toBeNull();
    });
  });

  describe('generateReleaseNotes', () => {
    test('should generate release notes from version data', () => {
      const versionData = {
        breaking: [
          {
            scope: 'api',
            subject: 'Remove deprecated endpoint'
          }
        ],
        changes: [
          {
            section: 'Features',
            emoji: '✨',
            commits: [
              {
                scope: 'core',
                subject: 'Add new feature',
                references: { prs: [42, 43] }
              },
              {
                subject: 'Another feature',
                references: { prs: [] }
              }
            ]
          },
          {
            section: 'Bug Fixes',
            emoji: '🐛',
            commits: [
              {
                scope: 'ui',
                subject: 'Fix layout issue',
                references: { prs: [44] }
              }
            ]
          }
        ]
      };

      const notes = github.generateReleaseNotes(versionData);

      expect(notes).toContain('## 💥 BREAKING CHANGES');
      expect(notes).toContain('**api:** Remove deprecated endpoint');
      expect(notes).toContain('## ✨ Features');
      expect(notes).toContain('**core:** Add new feature (#42, #43)');
      expect(notes).toContain('Another feature');
      expect(notes).toContain('## 🐛 Bug Fixes');
      expect(notes).toContain('**ui:** Fix layout issue (#44)');
    });

    test('should handle version without breaking changes', () => {
      const versionData = {
        breaking: [],
        changes: [
          {
            section: 'Features',
            emoji: '✨',
            commits: [
              {
                subject: 'New feature',
                references: { prs: [] }
              }
            ]
          }
        ]
      };

      const notes = github.generateReleaseNotes(versionData);

      expect(notes).not.toContain('BREAKING CHANGES');
      expect(notes).toContain('## ✨ Features');
      expect(notes).toContain('New feature');
    });

    test('should handle empty version data', () => {
      const versionData = {
        breaking: [],
        changes: []
      };

      const notes = github.generateReleaseNotes(versionData);

      expect(notes).toBe('');
    });
  });
});
