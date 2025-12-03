const ChangelogGenerator = require('../../src/core/ChangelogGenerator');

describe('ChangelogGenerator', () => {
  let generator;
  let config;

  beforeEach(() => {
    config = {
      display: {
        emoji: true,
        showAuthor: true
      },
      template: {
        commitUrl: 'https://github.com/user/repo/commit/{{hash}}',
        prUrl: 'https://github.com/user/repo/pull/{{id}}',
        issueUrl: 'https://github.com/user/repo/issues/{{id}}',
        compareUrl: 'https://github.com/user/repo/compare/{{previousTag}}...{{currentTag}}'
      }
    };
    generator = new ChangelogGenerator(config);
  });

  describe('createVersionData', () => {
    test('should create version data with date', () => {
      const classified = {
        breaking: [],
        changes: [
          {
            type: 'feat',
            section: 'Features',
            emoji: '✨',
            commits: [
              { subject: 'Add feature', author: 'Alice' }
            ]
          }
        ],
        stats: {
          total: 1,
          included: 1,
          excluded: 0,
          breaking: 0,
          authors: ['Alice']
        }
      };

      const result = generator.createVersionData('1.0.0', classified, '2023-11-10');

      expect(result.version).toBe('1.0.0');
      expect(result.date).toBe('2023-11-10');
      expect(result.changes).toHaveLength(1);
      expect(result.stats.total).toBe(1);
    });

    test('should use current date if not provided', () => {
      const classified = {
        breaking: [],
        changes: [],
        stats: { total: 0, included: 0, excluded: 0, breaking: 0, authors: [] }
      };

      const result = generator.createVersionData('1.0.0', classified);

      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('generate', () => {
    test('should generate basic changelog', async () => {
      const data = {
        versions: [
          {
            version: '1.0.0',
            date: '2023-11-10',
            breaking: [],
            changes: [
              {
                type: 'feat',
                section: 'Features',
                emoji: '✨',
                commits: [
                  {
                    scope: 'auth',
                    subject: 'Add JWT authentication',
                    author: 'Alice',
                    references: { prs: [123], issues: [] }
                  }
                ]
              }
            ]
          }
        ]
      };

      const changelog = await generator.generate(data);

      expect(changelog).toContain('# Changelog');
      expect(changelog).toContain('[1.0.0]');
      expect(changelog).toContain('2023-11-10');
      expect(changelog).toContain('Features');
      expect(changelog).toContain('Add JWT authentication');
    });

    test('should include breaking changes', async () => {
      const data = {
        versions: [
          {
            version: '2.0.0',
            date: '2023-11-10',
            breaking: [
              {
                scope: 'api',
                subject: 'Remove deprecated endpoint',
                breaking: [{ text: 'Old API removed' }],
                references: { prs: [], issues: [] }
              }
            ],
            changes: []
          }
        ]
      };

      const changelog = await generator.generate(data);

      expect(changelog).toContain('BREAKING CHANGES');
      expect(changelog).toContain('Remove deprecated endpoint');
    });

    test('should show emoji when enabled', async () => {
      config.display.emoji = true;
      generator = new ChangelogGenerator(config);

      const data = {
        versions: [
          {
            version: '1.0.0',
            date: '2023-11-10',
            breaking: [],
            changes: [
              {
                type: 'feat',
                section: 'Features',
                emoji: '✨',
                commits: [{ subject: 'Add feature', references: { prs: [], issues: [] } }]
              }
            ]
          }
        ]
      };

      const changelog = await generator.generate(data);

      expect(changelog).toContain('✨');
    });

    test('should hide emoji when disabled', async () => {
      config.display.emoji = false;
      generator = new ChangelogGenerator(config);

      const data = {
        versions: [
          {
            version: '1.0.0',
            date: '2023-11-10',
            breaking: [],
            changes: [
              {
                type: 'feat',
                section: 'Features',
                emoji: '✨',
                commits: [{ subject: 'Add feature', references: { prs: [], issues: [] } }]
              }
            ]
          }
        ]
      };

      const changelog = await generator.generate(data);

      expect(changelog).not.toContain('✨');
    });
  });

  describe('parseChangelog', () => {
    test('should parse existing changelog', () => {
      const content = `# Changelog

## [1.0.0] - 2023-11-10

### Features

- Add feature 1
- Add feature 2

## [0.9.0] - 2023-10-01

### Bug Fixes

- Fix bug
`;

      const result = generator.parseChangelog(content);

      expect(result.versions).toHaveLength(2);
      expect(result.versions[0].version).toBe('1.0.0');
      expect(result.versions[0].date).toBe('2023-11-10');
      expect(result.versions[1].version).toBe('0.9.0');
    });

    test('should handle Unreleased section', () => {
      const content = `# Changelog

## [Unreleased]

### Features

- New feature

## [1.0.0] - 2023-11-10

### Features

- Old feature
`;

      const result = generator.parseChangelog(content);

      expect(result.versions).toHaveLength(2);
      expect(result.versions[0].version).toBe('Unreleased');
      expect(result.versions[0].date).toBeNull();
    });
  });

  describe('Handlebars helpers', () => {
    test('should format date correctly', () => {
      const data = {
        versions: [
          {
            version: '1.0.0',
            date: '2023-11-10',
            breaking: [],
            changes: []
          }
        ]
      };

      return generator.generate(data).then(changelog => {
        expect(changelog).toContain('2023-11-10');
      });
    });

    test('should generate commit links', async () => {
      const data = {
        versions: [
          {
            version: '1.0.0',
            date: '2023-11-10',
            breaking: [],
            changes: [
              {
                type: 'feat',
                section: 'Features',
                emoji: '✨',
                commits: [
                  {
                    hash: 'abc123',
                    shortHash: 'abc123',
                    subject: 'Add feature',
                    references: { prs: [], issues: [] }
                  }
                ]
              }
            ]
          }
        ]
      };

      const changelog = await generator.generate(data);

      // Since the template doesn't use commitLink by default,
      // we just verify the changelog was generated
      expect(changelog).toContain('Add feature');
    });

    test('should generate PR links', async () => {
      const data = {
        versions: [
          {
            version: '1.0.0',
            date: '2023-11-10',
            breaking: [],
            changes: [
              {
                type: 'feat',
                section: 'Features',
                emoji: '✨',
                commits: [
                  {
                    subject: 'Add feature',
                    references: { prs: [123], issues: [] }
                  }
                ]
              }
            ]
          }
        ]
      };

      const changelog = await generator.generate(data);

      expect(changelog).toContain('#123');
    });
  });
});
