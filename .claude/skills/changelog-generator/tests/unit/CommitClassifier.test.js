const CommitClassifier = require('../../src/core/CommitClassifier');

describe('CommitClassifier', () => {
  let classifier;
  let config;

  beforeEach(() => {
    config = {
      types: [
        { type: 'feat', section: 'Features', emoji: '✨', priority: 1 },
        { type: 'fix', section: 'Bug Fixes', emoji: '🐛', priority: 2 },
        { type: 'docs', section: 'Documentation', emoji: '📝', priority: 3 },
        { type: 'chore', section: 'Chores', emoji: '🔧', priority: 4, hidden: true }
      ],
      exclude: {
        types: [],
        scopes: []
      }
    };
    classifier = new CommitClassifier(config);
  });

  describe('classify', () => {
    test('should classify commits by type', () => {
      const commits = [
        { type: 'feat', subject: 'Add feature 1', author: 'Alice', isBreaking: false },
        { type: 'feat', subject: 'Add feature 2', author: 'Bob', isBreaking: false },
        { type: 'fix', subject: 'Fix bug', author: 'Charlie', isBreaking: false }
      ];

      const result = classifier.classify(commits);

      expect(result.changes).toHaveLength(2); // feat and fix
      expect(result.changes[0].type).toBe('feat');
      expect(result.changes[0].commits).toHaveLength(2);
      expect(result.changes[1].type).toBe('fix');
      expect(result.changes[1].commits).toHaveLength(1);
    });

    test('should separate breaking changes', () => {
      const commits = [
        { type: 'feat', subject: 'Add feature', author: 'Alice', isBreaking: false, breaking: [] },
        { type: 'feat', subject: 'Breaking change', author: 'Bob', isBreaking: true, breaking: [{ text: 'API changed' }] }
      ];

      const result = classifier.classify(commits);

      expect(result.breaking).toHaveLength(1);
      expect(result.breaking[0].subject).toBe('Breaking change');
      expect(result.changes[0].commits).toHaveLength(1); // Only non-breaking feat
    });

    test('should exclude hidden types', () => {
      const commits = [
        { type: 'feat', subject: 'Add feature', author: 'Alice', isBreaking: false },
        { type: 'chore', subject: 'Update deps', author: 'Bob', isBreaking: false }
      ];

      const result = classifier.classify(commits);

      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('feat');
    });

    test('should generate correct statistics', () => {
      const commits = [
        { type: 'feat', subject: 'Feature 1', author: 'Alice', isBreaking: false },
        { type: 'feat', subject: 'Feature 2', author: 'Bob', isBreaking: true, breaking: [{}] },
        { type: 'fix', subject: 'Fix', author: 'Alice', isBreaking: false },
        { type: 'chore', subject: 'Chore', author: 'Charlie', isBreaking: false }
      ];

      const result = classifier.classify(commits);

      expect(result.stats.total).toBe(4);
      expect(result.stats.included).toBe(3); // chore is hidden
      expect(result.stats.breaking).toBe(1);
      expect(result.stats.authors).toHaveLength(2); // Only Alice and Bob (chore is excluded)
      expect(result.stats.authors).toContain('Alice');
      expect(result.stats.authors).toContain('Bob');
    });
  });

  describe('shouldInclude', () => {
    test('should include normal commits', () => {
      const commit = { type: 'feat', scope: 'api' };
      expect(classifier.shouldInclude(commit)).toBe(true);
    });

    test('should exclude types in exclude list', () => {
      classifier.excludeTypes = ['chore'];
      const commit = { type: 'chore', scope: null };
      expect(classifier.shouldInclude(commit)).toBe(false);
    });

    test('should exclude scopes in exclude list', () => {
      classifier.excludeScopes = ['deps'];
      const commit = { type: 'feat', scope: 'deps' };
      expect(classifier.shouldInclude(commit)).toBe(false);
    });

    test('should exclude hidden types from config', () => {
      const commit = { type: 'chore', scope: null };
      expect(classifier.shouldInclude(commit)).toBe(false);
    });
  });

  describe('groupByType', () => {
    test('should group commits by type', () => {
      const commits = [
        { type: 'feat', subject: 'Feature 1' },
        { type: 'feat', subject: 'Feature 2' },
        { type: 'fix', subject: 'Fix' }
      ];

      const result = classifier.groupByType(commits);

      expect(result.feat).toHaveLength(2);
      expect(result.fix).toHaveLength(1);
    });

    test('should handle commits without type', () => {
      const commits = [
        { type: null, subject: 'No type' }
      ];

      const result = classifier.groupByType(commits);

      expect(result.other).toHaveLength(1);
    });
  });

  describe('groupByScope', () => {
    test('should group commits by scope', () => {
      const commits = [
        { scope: 'auth', subject: 'Auth feature' },
        { scope: 'auth', subject: 'Auth fix' },
        { scope: 'api', subject: 'API feature' }
      ];

      const result = classifier.groupByScope(commits);

      expect(result.auth).toHaveLength(2);
      expect(result.api).toHaveLength(1);
    });

    test('should use "general" for commits without scope', () => {
      const commits = [
        { scope: null, subject: 'No scope' }
      ];

      const result = classifier.groupByScope(commits);

      expect(result.general).toHaveLength(1);
    });
  });

  describe('validateCommit', () => {
    test('should validate correct commit', () => {
      const commit = {
        type: 'feat',
        subject: 'Add new feature'
      };

      const result = classifier.validateCommit(commit);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail without subject', () => {
      const commit = {
        type: 'feat',
        subject: ''
      };

      const result = classifier.validateCommit(commit);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    test('should warn for unknown type', () => {
      const commit = {
        type: 'unknown',
        subject: 'Some change'
      };

      const result = classifier.validateCommit(commit);

      expect(result.warnings).toHaveLength(1);
    });

    test('should warn for long subject', () => {
      const commit = {
        type: 'feat',
        subject: 'A'.repeat(150)
      };

      const result = classifier.validateCommit(commit);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
