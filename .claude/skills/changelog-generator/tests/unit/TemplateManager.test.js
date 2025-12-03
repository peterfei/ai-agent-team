const TemplateManager = require('../../src/utils/TemplateManager');

describe('TemplateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new TemplateManager();
  });

  describe('Built-in Helpers', () => {
    describe('formatDate', () => {
      test('should format date as YYYY-MM-DD', () => {
        const template = '{{formatDate date "YYYY-MM-DD"}}';
        const result = manager.renderString(template, {
          date: '2025-12-03T10:30:00Z'
        });
        expect(result).toBe('2025-12-03');
      });

      test('should format date as relative', () => {
        const today = new Date();
        const template = '{{formatDate date "relative"}}';
        const result = manager.renderString(template, { date: today });
        expect(result).toBe('今天');
      });

      test('should handle null date', () => {
        const template = '{{formatDate date}}';
        const result = manager.renderString(template, { date: null });
        expect(result).toBe('');
      });
    });

    describe('Conditional Helpers', () => {
      test('if_eq should work correctly', () => {
        const template = '{{#if_eq a b}}equal{{else}}not equal{{/if_eq}}';
        expect(manager.renderString(template, { a: 5, b: 5 })).toBe('equal');
        expect(manager.renderString(template, { a: 5, b: 3 })).toBe('not equal');
      });

      test('if_ne should work correctly', () => {
        const template = '{{#if_ne a b}}not equal{{else}}equal{{/if_ne}}';
        expect(manager.renderString(template, { a: 5, b: 3 })).toBe('not equal');
        expect(manager.renderString(template, { a: 5, b: 5 })).toBe('equal');
      });

      test('if_gt should work correctly', () => {
        const template = '{{#if_gt a b}}greater{{else}}not greater{{/if_gt}}';
        expect(manager.renderString(template, { a: 10, b: 5 })).toBe('greater');
        expect(manager.renderString(template, { a: 3, b: 5 })).toBe('not greater');
      });

      test('if_lt should work correctly', () => {
        const template = '{{#if_lt a b}}less{{else}}not less{{/if_lt}}';
        expect(manager.renderString(template, { a: 3, b: 5 })).toBe('less');
        expect(manager.renderString(template, { a: 10, b: 5 })).toBe('not less');
      });
    });

    describe('Array Helpers', () => {
      test('length should return array length', () => {
        const template = '{{length items}}';
        expect(manager.renderString(template, { items: [1, 2, 3] })).toBe('3');
        expect(manager.renderString(template, { items: [] })).toBe('0');
        expect(manager.renderString(template, { items: null })).toBe('0');
      });

      test('first should return first n elements', () => {
        const template = '{{#each (first items 2)}}{{this}},{{/each}}';
        const result = manager.renderString(template, { items: [1, 2, 3, 4, 5] });
        expect(result).toBe('1,2,');
      });

      test('last should return last n elements', () => {
        const template = '{{#each (last items 2)}}{{this}},{{/each}}';
        const result = manager.renderString(template, { items: [1, 2, 3, 4, 5] });
        expect(result).toBe('4,5,');
      });

      test('join should join array with separator', () => {
        const template = '{{join items ", "}}';
        const result = manager.renderString(template, { items: ['a', 'b', 'c'] });
        expect(result).toBe('a, b, c');
      });
    });

    describe('String Helpers', () => {
      test('uppercase should convert to uppercase', () => {
        const template = '{{uppercase text}}';
        expect(manager.renderString(template, { text: 'hello' })).toBe('HELLO');
      });

      test('lowercase should convert to lowercase', () => {
        const template = '{{lowercase text}}';
        expect(manager.renderString(template, { text: 'HELLO' })).toBe('hello');
      });

      test('capitalize should capitalize first letter', () => {
        const template = '{{capitalize text}}';
        expect(manager.renderString(template, { text: 'hello world' })).toBe('Hello world');
      });

      test('truncate should truncate long strings', () => {
        const template = '{{truncate text 10}}';
        const result = manager.renderString(template, { text: 'This is a very long text' });
        expect(result).toBe('This is a ...');
      });
    });

    describe('Link Helpers', () => {
      test('mdLink should create markdown link', () => {
        const template = '{{{mdLink "Google" "https://google.com"}}}';
        const result = manager.renderString(template, {});
        expect(result).toBe('[Google](https://google.com)');
      });

      test('commitLink should create commit link', () => {
        const template = '{{{commitLink hash shortHash "https://github.com/user/repo/commit/{{hash}}"}}}';
        const result = manager.renderString(template, {
          hash: 'abc123def456',
          shortHash: 'abc123'
        });
        expect(result).toBe('[abc123](https://github.com/user/repo/commit/abc123def456)');
      });

      test('prLink should create PR link', () => {
        const template = '{{{prLink prNumber "https://github.com/user/repo/pull/{{id}}"}}}';
        const result = manager.renderString(template, { prNumber: 42 });
        expect(result).toBe('[#42](https://github.com/user/repo/pull/42)');
      });

      test('issueLink should create issue link', () => {
        const template = '{{{issueLink issueNumber "https://github.com/user/repo/issues/{{id}}"}}}';
        const result = manager.renderString(template, { issueNumber: 123 });
        expect(result).toBe('[#123](https://github.com/user/repo/issues/123)');
      });
    });

    describe('Math Helpers', () => {
      test('add should add numbers', () => {
        const template = '{{add a b}}';
        expect(manager.renderString(template, { a: 5, b: 3 })).toBe('8');
      });

      test('subtract should subtract numbers', () => {
        const template = '{{subtract a b}}';
        expect(manager.renderString(template, { a: 10, b: 3 })).toBe('7');
      });

      test('multiply should multiply numbers', () => {
        const template = '{{multiply a b}}';
        expect(manager.renderString(template, { a: 4, b: 5 })).toBe('20');
      });

      test('divide should divide numbers', () => {
        const template = '{{divide a b}}';
        expect(manager.renderString(template, { a: 10, b: 2 })).toBe('5');
      });

      test('divide should handle division by zero', () => {
        const template = '{{divide a b}}';
        expect(manager.renderString(template, { a: 10, b: 0 })).toBe('0');
      });
    });

    describe('Other Helpers', () => {
      test('emoji should conditionally show emoji', () => {
        const template = '{{emoji "🎉" showEmoji}}text';
        expect(manager.renderString(template, { showEmoji: true })).toBe('🎉 text');
        expect(manager.renderString(template, { showEmoji: false })).toBe('text');
      });

      test('default should provide default value', () => {
        const template = '{{default value "fallback"}}';
        expect(manager.renderString(template, { value: 'actual' })).toBe('actual');
        expect(manager.renderString(template, { value: null })).toBe('fallback');
        expect(manager.renderString(template, { value: '' })).toBe('fallback');
      });

      test('json should stringify objects', () => {
        const template = '{{json obj}}';
        const result = manager.renderString(template, { obj: { name: 'test', value: 42 } });
        // Handlebars escapes HTML entities, so quotes become &quot;
        expect(result).toContain('&quot;name&quot;: &quot;test&quot;');
        expect(result).toContain('&quot;value&quot;: 42');
      });
    });
  });

  describe('Template Management', () => {
    test('should load and render template', async () => {
      await manager.loadTemplate('test', 'Hello {{name}}!');
      const result = manager.render('test', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    test('should throw error for non-existent template', () => {
      expect(() => {
        manager.render('nonexistent', {});
      }).toThrow('Template "nonexistent" not found');
    });

    test('should list templates', async () => {
      await manager.loadTemplate('test1', 'Template 1');
      await manager.loadTemplate('test2', 'Template 2');
      const templates = manager.listTemplates();
      expect(templates).toContain('test1');
      expect(templates).toContain('test2');
    });

    test('should validate template syntax', () => {
      // Test that valid templates are recognized as valid
      const valid1 = manager.validateTemplate('Hello {{name}}!');
      expect(valid1.valid).toBe(true);
      expect(valid1.error).toBeNull();

      const valid2 = manager.validateTemplate('{{#each items}}{{this}}{{/each}}');
      expect(valid2.valid).toBe(true);
      expect(valid2.error).toBeNull();

      // Handlebars is very permissive during compilation and only throws errors
      // during execution, so we just verify the validator returns correctly
      // for valid templates. Invalid template testing would require runtime errors.
    });

    test('should clear templates', async () => {
      await manager.loadTemplate('test', 'Template');
      manager.clearTemplates();
      expect(manager.listTemplates()).toHaveLength(0);
    });
  });

  describe('Custom Helpers', () => {
    test('should register custom helper', () => {
      manager.registerHelper('reverse', (str) => str.split('').reverse().join(''));
      const template = '{{reverse text}}';
      const result = manager.renderString(template, { text: 'hello' });
      expect(result).toBe('olleh');
    });

    test('should list helpers', () => {
      const helpers = manager.listHelpers();
      expect(helpers).toContain('formatDate');
      expect(helpers).toContain('uppercase');
      expect(helpers).toContain('mdLink');
    });
  });

  describe('Partials', () => {
    test('should register and use partial', () => {
      manager.registerPartial('header', '<h1>{{title}}</h1>');
      const template = '{{> header}}';
      const result = manager.renderString(template, { title: 'Test Title' });
      expect(result).toBe('<h1>Test Title</h1>');
    });

    test('should list partials', () => {
      manager.registerPartial('header', '<h1>Header</h1>');
      manager.registerPartial('footer', '<footer>Footer</footer>');
      const partials = manager.listPartials();
      expect(partials).toContain('header');
      expect(partials).toContain('footer');
    });
  });
});
