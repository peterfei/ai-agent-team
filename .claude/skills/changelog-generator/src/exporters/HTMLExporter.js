const Handlebars = require('handlebars');

/**
 * HTMLExporter - HTML 格式导出器
 * 负责将 CHANGELOG 数据导出为美观的 HTML 格式
 */
class HTMLExporter {
  /**
   * @param {Object} config - 配置对象
   */
  constructor(config) {
    this.config = config;
    this.registerHelpers();
  }

  /**
   * 注册 Handlebars 辅助函数
   */
  registerHelpers() {
    // 格式化日期
    Handlebars.registerHelper('formatDate', (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    // 生成提交链接
    Handlebars.registerHelper('commitLink', (hash, shortHash, url) => {
      if (url) {
        return new Handlebars.SafeString(`<a href="${url.replace('{{hash}}', hash)}" class="commit-link">${shortHash}</a>`);
      }
      return shortHash;
    });

    // 生成 PR 链接
    Handlebars.registerHelper('prLink', (prNumber, url) => {
      if (url) {
        return new Handlebars.SafeString(`<a href="${url.replace('{{id}}', prNumber)}" class="pr-link">#${prNumber}</a>`);
      }
      return `#${prNumber}`;
    });

    // 转义 HTML
    Handlebars.registerHelper('escapeHtml', (text) => {
      if (!text) return '';
      return Handlebars.escapeExpression(text);
    });
  }

  /**
   * 导出为 HTML
   * @param {Object} data - CHANGELOG 数据
   * @returns {string} HTML 内容
   */
  export(data) {
    const template = this.getHTMLTemplate();
    const compiled = Handlebars.compile(template);

    const context = {
      ...data,
      config: this.config,
      title: data.title || 'Changelog',
      generatedAt: new Date().toISOString()
    };

    return compiled(context);
  }

  /**
   * 获取 HTML 模板
   * @returns {string} HTML 模板
   */
  getHTMLTemplate() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header p {
            font-size: 18px;
            opacity: 0.9;
        }

        .content {
            padding: 40px;
        }

        .search-box {
            margin-bottom: 30px;
            position: sticky;
            top: 0;
            background: white;
            padding: 20px 0;
            z-index: 100;
            border-bottom: 2px solid #f0f0f0;
        }

        .search-input {
            width: 100%;
            padding: 15px 20px;
            font-size: 16px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            transition: all 0.3s ease;
        }

        .search-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .version {
            margin-bottom: 50px;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .version-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }

        .version-tag {
            font-size: 32px;
            font-weight: 700;
            color: #667eea;
            margin-right: 15px;
        }

        .version-date {
            font-size: 18px;
            color: #666;
            font-weight: 500;
        }

        .version-badge {
            margin-left: auto;
            padding: 8px 16px;
            background: #667eea;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }

        .version-badge.unreleased {
            background: #ffa502;
        }

        .category {
            margin-bottom: 40px;
        }

        .category-title {
            display: flex;
            align-items: center;
            font-size: 24px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
            padding: 15px 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #667eea;
        }

        .category-emoji {
            margin-right: 10px;
            font-size: 28px;
        }

        .breaking-title {
            border-left-color: #e74c3c;
            background: #fee;
        }

        .commits-list {
            list-style: none;
            padding-left: 20px;
        }

        .commit-item {
            position: relative;
            padding: 15px 20px;
            margin-bottom: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
        }

        .commit-item:hover {
            background: #e9ecef;
            border-left-color: #667eea;
            transform: translateX(5px);
        }

        .commit-scope {
            font-weight: 600;
            color: #667eea;
            margin-right: 5px;
        }

        .commit-subject {
            color: #333;
        }

        .commit-meta {
            margin-top: 8px;
            font-size: 14px;
            color: #666;
        }

        .commit-link, .pr-link, .issue-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .commit-link:hover, .pr-link:hover, .issue-link:hover {
            color: #764ba2;
            text-decoration: underline;
        }

        .commit-author {
            color: #666;
            font-style: italic;
        }

        .stats {
            margin-top: 50px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 15px;
            border: 2px dashed #e0e0e0;
        }

        .stats-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #333;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .stat-item {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .stat-value {
            font-size: 36px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
        }

        .footer a {
            color: #667eea;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        .no-results {
            text-align: center;
            padding: 60px 20px;
            color: #999;
            font-size: 18px;
        }

        @media (max-width: 768px) {
            body {
                padding: 20px 10px;
            }

            .header {
                padding: 40px 20px;
            }

            .header h1 {
                font-size: 32px;
            }

            .content {
                padding: 20px;
            }

            .version-tag {
                font-size: 24px;
            }

            .category-title {
                font-size: 20px;
            }
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .search-box {
                display: none;
            }

            .commit-item:hover {
                transform: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{title}}</h1>
            <p>版本变更历史记录</p>
        </div>

        <div class="content">
            <div class="search-box">
                <input
                    type="text"
                    class="search-input"
                    placeholder="🔍 搜索版本、功能或修复..."
                    id="searchInput"
                >
            </div>

            <div id="versionsContainer">
                {{#each versions}}
                <div class="version" data-version="{{version}}">
                    <div class="version-header">
                        <span class="version-tag">[{{version}}]</span>
                        {{#if date}}
                        <span class="version-date">{{formatDate date}}</span>
                        {{/if}}
                        {{#if (eq version "Unreleased")}}
                        <span class="version-badge unreleased">未发布</span>
                        {{else}}
                        <span class="version-badge">已发布</span>
                        {{/if}}
                    </div>

                    {{#if breaking}}
                    {{#if breaking.length}}
                    <div class="category">
                        <h3 class="category-title breaking-title">
                            <span class="category-emoji">💥</span>
                            BREAKING CHANGES
                        </h3>
                        <ul class="commits-list">
                            {{#each breaking}}
                            <li class="commit-item">
                                {{#if scope}}<span class="commit-scope">{{scope}}:</span>{{/if}}
                                <span class="commit-subject">{{subject}}</span>
                                {{#if references.prs.length}}
                                <div class="commit-meta">
                                    {{#each references.prs}}
                                    {{{prLink this ../../../config.template.prUrl}}}
                                    {{/each}}
                                </div>
                                {{/if}}
                            </li>
                            {{/each}}
                        </ul>
                    </div>
                    {{/if}}
                    {{/if}}

                    {{#each changes}}
                    <div class="category">
                        <h3 class="category-title">
                            <span class="category-emoji">{{emoji}}</span>
                            {{section}}
                        </h3>
                        <ul class="commits-list">
                            {{#each commits}}
                            <li class="commit-item">
                                {{#if scope}}<span class="commit-scope">{{scope}}:</span>{{/if}}
                                <span class="commit-subject">{{subject}}</span>
                                <div class="commit-meta">
                                    {{#if references.prs.length}}
                                    {{#each references.prs}}
                                    {{{prLink this ../../../config.template.prUrl}}}
                                    {{/each}}
                                    {{/if}}
                                    {{#if author}}
                                    <span class="commit-author">by @{{author}}</span>
                                    {{/if}}
                                </div>
                            </li>
                            {{/each}}
                        </ul>
                    </div>
                    {{/each}}
                </div>
                {{/each}}
            </div>

            <div class="no-results" id="noResults" style="display: none;">
                <p>😔 没有找到匹配的结果</p>
            </div>

            {{#if stats}}
            <div class="stats">
                <h3 class="stats-title">📊 统计信息</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">{{stats.total}}</div>
                        <div class="stat-label">总提交数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{stats.included}}</div>
                        <div class="stat-label">已包含</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{stats.breaking}}</div>
                        <div class="stat-label">破坏性变更</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{stats.authors.length}}</div>
                        <div class="stat-label">贡献者</div>
                    </div>
                </div>
            </div>
            {{/if}}
        </div>

        <div class="footer">
            <p>生成时间: {{formatDate generatedAt}}</p>
            <p>由 <a href="https://github.com/peterfei/ai-agent-team" target="_blank">changelog-generator</a> 自动生成</p>
        </div>
    </div>

    <script>
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const versionsContainer = document.getElementById('versionsContainer');
        const noResults = document.getElementById('noResults');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const versions = versionsContainer.querySelectorAll('.version');
            let hasResults = false;

            versions.forEach(version => {
                const text = version.textContent.toLowerCase();
                if (query === '' || text.includes(query)) {
                    version.style.display = 'block';
                    hasResults = true;
                } else {
                    version.style.display = 'none';
                }
            });

            noResults.style.display = hasResults ? 'none' : 'block';
        });

        // 平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>`;
  }
}

// Handlebars helper for equality check
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

module.exports = HTMLExporter;
