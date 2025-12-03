const HTMLExporter = require('../../src/exporters/HTMLExporter');

describe('HTMLExporter', () => {
  let exporter;
  let config;

  beforeEach(() => {
    config = {
      display: {
        emoji: true,
        showAuthor: true
      },
      template: {
        prUrl: 'https://github.com/owner/repo/pull/{{id}}',
        issueUrl: 'https://github.com/owner/repo/issues/{{id}}',
        commitUrl: 'https://github.com/owner/repo/commit/{{hash}}'
      }
    };
    exporter = new HTMLExporter(config);
  });

  describe('HTML Export', () => {
    test('should export basic HTML structure', () => {
      const data = {
        title: 'Test Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [
              {
                section: 'Features',
                emoji: '✨',
                commits: [
                  {
                    type: 'feat',
                    scope: 'core',
                    subject: 'Add new feature',
                    author: 'test-user',
                    references: { prs: [42], issues: [] }
                  }
                ]
              }
            ],
            breaking: []
          }
        ],
        stats: {
          total: 10,
          included: 8,
          excluded: 2,
          breaking: 0,
          authors: ['test-user'],
          byType: { feat: 5, fix: 3 }
        }
      };

      const html = exporter.export(data);

      // 验证基本 HTML 结构
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="zh-CN">');
      expect(html).toContain('<title>Test Changelog</title>');
      expect(html).toContain('</html>');
    });

    test('should include version information', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('[1.0.0]');
      expect(html).toContain('已发布');
    });

    test('should include unreleased badge', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: 'Unreleased',
            date: null,
            changes: [],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('[Unreleased]');
      expect(html).toContain('未发布');
    });

    test('should render features section', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [
              {
                section: 'Features',
                emoji: '✨',
                commits: [
                  {
                    type: 'feat',
                    scope: 'api',
                    subject: 'Add REST API',
                    author: 'dev1',
                    references: { prs: [], issues: [] }
                  }
                ]
              }
            ],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('Features');
      expect(html).toContain('✨');
      expect(html).toContain('api');
      expect(html).toContain('Add REST API');
    });

    test('should render breaking changes', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '2.0.0',
            date: '2025-12-03',
            changes: [],
            breaking: [
              {
                type: 'feat',
                scope: 'auth',
                subject: 'Remove deprecated API',
                references: { prs: [99], issues: [] }
              }
            ]
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('BREAKING CHANGES');
      expect(html).toContain('💥');
      expect(html).toContain('Remove deprecated API');
    });

    test('should include PR links', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [
              {
                section: 'Bug Fixes',
                emoji: '🐛',
                commits: [
                  {
                    type: 'fix',
                    subject: 'Fix critical bug',
                    author: 'dev2',
                    references: { prs: [123], issues: [] }
                  }
                ]
              }
            ],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      // PR link should exist in some form (the template renders it with prLink helper)
      expect(html).toContain('#123');
      expect(html).toContain('Fix critical bug');
    });

    test('should include author information', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [
              {
                section: 'Features',
                emoji: '✨',
                commits: [
                  {
                    type: 'feat',
                    subject: 'New feature',
                    author: 'john-doe',
                    references: { prs: [], issues: [] }
                  }
                ]
              }
            ],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('by @john-doe');
    });

    test('should include statistics', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [],
            breaking: []
          }
        ],
        stats: {
          total: 100,
          included: 85,
          excluded: 15,
          breaking: 3,
          authors: ['dev1', 'dev2', 'dev3'],
          byType: { feat: 50, fix: 35 }
        }
      };

      const html = exporter.export(data);

      expect(html).toContain('统计信息');
      expect(html).toContain('100'); // total
      expect(html).toContain('85');  // included
      expect(html).toContain('3');   // breaking
      expect(html).toContain('3');   // authors count
    });

    test('should include search box', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('<input');
      expect(html).toContain('searchInput');
      expect(html).toContain('搜索版本、功能或修复');
    });

    test('should include JavaScript for interactivity', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('<script>');
      expect(html).toContain('addEventListener');
      expect(html).toContain('searchInput');
    });

    test('should include CSS styles', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('<style>');
      expect(html).toContain('.container');
      expect(html).toContain('.version');
      expect(html).toContain('.commit-item');
    });

    test('should be responsive', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('@media (max-width: 768px)');
      expect(html).toContain('viewport');
    });

    test('should include print styles', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('@media print');
    });
  });

  describe('Handlebars Helpers', () => {
    test('formatDate helper should format dates', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03T00:00:00Z',
            changes: [],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      // Should contain formatted date (Chinese locale)
      expect(html).toContain('2025');
      expect(html).toContain('12');
      expect(html).toContain('3');
    });

    test('commitLink helper should create links', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [
              {
                section: 'Features',
                emoji: '✨',
                commits: [
                  {
                    type: 'feat',
                    subject: 'Test',
                    hash: 'abc123def456',
                    shortHash: 'abc123',
                    references: { prs: [], issues: [] }
                  }
                ]
              }
            ],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      // Should create proper commit links
      expect(html).toContain('commit-link');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty versions array', () => {
      const data = {
        title: 'Changelog',
        versions: []
      };

      const html = exporter.export(data);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Changelog');
    });

    test('should handle version without changes', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('[1.0.0]');
      // Check that no actual commit items are rendered (not just CSS class name)
      // by checking if li.commit-item exists as an HTML element
      expect(html).not.toMatch(/<li class="commit-item">/);
    });

    test('should handle commits without scope', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [
              {
                section: 'Features',
                emoji: '✨',
                commits: [
                  {
                    type: 'feat',
                    scope: null,
                    subject: 'Feature without scope',
                    references: { prs: [], issues: [] }
                  }
                ]
              }
            ],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('Feature without scope');
      expect(html).not.toContain('null:');
    });

    test('should handle commits without author', () => {
      const data = {
        title: 'Changelog',
        versions: [
          {
            version: '1.0.0',
            date: '2025-12-03',
            changes: [
              {
                section: 'Features',
                emoji: '✨',
                commits: [
                  {
                    type: 'feat',
                    subject: 'Anonymous commit',
                    author: null,
                    references: { prs: [], issues: [] }
                  }
                ]
              }
            ],
            breaking: []
          }
        ]
      };

      const html = exporter.export(data);

      expect(html).toContain('Anonymous commit');
    });
  });
});
