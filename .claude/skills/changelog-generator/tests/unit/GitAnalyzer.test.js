const GitAnalyzer = require('../../src/core/GitAnalyzer');

describe('GitAnalyzer', () => {
  describe('parseCommitMessage', () => {
    let analyzer;

    beforeEach(() => {
      analyzer = new GitAnalyzer('.');
    });

    test('should parse conventional commit with type and scope', () => {
      const message = 'feat(auth): add JWT authentication';
      const result = analyzer.parseCommitMessage(message);

      expect(result.type).toBe('feat');
      expect(result.scope).toBe('auth');
      expect(result.subject).toBe('add JWT authentication');
      expect(result.isBreaking).toBe(false);
    });

    test('should parse commit without scope', () => {
      const message = 'fix: resolve button alignment issue';
      const result = analyzer.parseCommitMessage(message);

      expect(result.type).toBe('fix');
      expect(result.scope).toBeNull();
      expect(result.subject).toBe('resolve button alignment issue');
    });

    test('should detect breaking change with ! syntax', () => {
      const message = 'feat!: remove deprecated API';
      const result = analyzer.parseCommitMessage(message);

      expect(result.type).toBe('feat');
      expect(result.isBreaking).toBe(true);
      expect(result.breaking).toHaveLength(1);
    });

    test('should detect breaking change in footer', () => {
      const message = `feat: add new feature

BREAKING CHANGE: Old API is removed`;
      const result = analyzer.parseCommitMessage(message);

      expect(result.type).toBe('feat');
      expect(result.isBreaking).toBe(true);
      expect(result.breaking).toHaveLength(1);
      expect(result.breaking[0].text).toContain('Old API is removed');
    });

    test('should handle non-conventional commit', () => {
      const message = 'just a regular commit message';
      const result = analyzer.parseCommitMessage(message);

      expect(result.type).toBe('other');
      expect(result.subject).toBe('just a regular commit message');
    });
  });

  describe('extractReferences', () => {
    let analyzer;

    beforeEach(() => {
      analyzer = new GitAnalyzer('.');
    });

    test('should extract PR number with # syntax', () => {
      const message = 'feat: add feature (#123)';
      const result = analyzer.extractReferences(message);

      expect(result.prs).toContain(123);
    });

    test('should extract multiple PR numbers', () => {
      const message = 'feat: add feature (#123) (#456)';
      const result = analyzer.extractReferences(message);

      expect(result.prs).toContain(123);
      expect(result.prs).toContain(456);
    });

    test('should extract issue numbers with closes/fixes', () => {
      const message = 'fix: resolve bug\n\nCloses #123\nFixes #456';
      const result = analyzer.extractReferences(message);

      expect(result.issues).toContain(123);
      expect(result.issues).toContain(456);
    });

    test('should not extract duplicate numbers', () => {
      const message = 'feat: add feature (#123) (#123)';
      const result = analyzer.extractReferences(message);

      expect(result.prs).toHaveLength(1);
      expect(result.prs[0]).toBe(123);
    });
  });

  describe('parseRemoteUrl', () => {
    let analyzer;

    beforeEach(() => {
      analyzer = new GitAnalyzer('.');
    });

    test('should parse HTTPS GitHub URL', () => {
      const url = 'https://github.com/user/repo.git';
      const result = analyzer.parseRemoteUrl(url);

      expect(result).toEqual({
        host: 'github.com',
        owner: 'user',
        repo: 'repo'
      });
    });

    test('should parse HTTPS GitHub URL without .git', () => {
      const url = 'https://github.com/user/repo';
      const result = analyzer.parseRemoteUrl(url);

      expect(result).toEqual({
        host: 'github.com',
        owner: 'user',
        repo: 'repo'
      });
    });

    test('should parse SSH GitHub URL', () => {
      const url = 'git@github.com:user/repo.git';
      const result = analyzer.parseRemoteUrl(url);

      expect(result).toEqual({
        host: 'github.com',
        owner: 'user',
        repo: 'repo'
      });
    });

    test('should parse GitLab URL', () => {
      const url = 'https://gitlab.com/user/repo.git';
      const result = analyzer.parseRemoteUrl(url);

      expect(result).toEqual({
        host: 'gitlab.com',
        owner: 'user',
        repo: 'repo'
      });
    });

    test('should return null for invalid URL', () => {
      const url = 'not-a-valid-url';
      const result = analyzer.parseRemoteUrl(url);

      expect(result).toBeNull();
    });
  });
});
