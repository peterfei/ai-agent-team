#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs').promises;
const inquirer = require('inquirer');

const GitAnalyzer = require('../src/core/GitAnalyzer');
const CommitClassifier = require('../src/core/CommitClassifier');
const ChangelogGenerator = require('../src/core/ChangelogGenerator');
const ConfigLoader = require('../src/utils/ConfigLoader');
const HTMLExporter = require('../src/exporters/HTMLExporter');
const GitHubIntegration = require('../src/integrations/GitHubIntegration');

const program = new Command();

program
  .name('changelog-generate')
  .description('智能变更日志生成器 - 自动生成规范的 CHANGELOG.md')
  .version('1.0.0');

/**
 * 初始化配置
 */
program
  .command('init')
  .description('初始化配置文件')
  .action(async () => {
    console.log(chalk.cyan('📝 初始化 changelog-generator 配置...\n'));

    try {
      const cwd = process.cwd();
      const configPath = path.join(cwd, '.changelogrc.json');

      // 检查是否已存在配置
      try {
        await fs.access(configPath);
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: '配置文件已存在，是否覆盖？',
            default: false
          }
        ]);

        if (!overwrite) {
          console.log(chalk.yellow('已取消'));
          return;
        }
      } catch (error) {
        // 文件不存在，继续
      }

      // 获取 Git 仓库信息
      const analyzer = new GitAnalyzer(cwd);
      const remoteUrl = await analyzer.getRemoteUrl();
      const repoInfo = analyzer.parseRemoteUrl(remoteUrl);

      // 交互式配置
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'version',
          message: '当前版本号:',
          default: '0.1.0'
        },
        {
          type: 'list',
          name: 'language',
          message: '选择语言:',
          choices: [
            { name: '中文', value: 'zh-CN' },
            { name: 'English', value: 'en-US' }
          ],
          default: 'zh-CN'
        },
        {
          type: 'confirm',
          name: 'emoji',
          message: '使用 emoji 图标？',
          default: true
        },
        {
          type: 'confirm',
          name: 'showAuthor',
          message: '显示作者信息？',
          default: true
        }
      ]);

      // 创建配置
      const config = {
        version: answers.version,
        format: 'keepachangelog',
        language: answers.language,

        git: repoInfo ? {
          remoteUrl: remoteUrl,
          compareUrlFormat: `https://${repoInfo.host}/${repoInfo.owner}/${repoInfo.repo}/compare/{{previousTag}}...{{currentTag}}`
        } : {},

        display: {
          emoji: answers.emoji,
          groupByType: true,
          showAuthor: answers.showAuthor,
          showPR: true,
          showIssue: true,
          showCommitHash: false
        },

        types: [
          { type: 'feat', section: 'Features', emoji: '✨' },
          { type: 'fix', section: 'Bug Fixes', emoji: '🐛' },
          { type: 'docs', section: 'Documentation', emoji: '📝' },
          { type: 'style', hidden: true },
          { type: 'refactor', section: 'Code Refactoring', emoji: '♻️' },
          { type: 'perf', section: 'Performance', emoji: '⚡' },
          { type: 'test', section: 'Tests', emoji: '✅' },
          { type: 'build', section: 'Build System', emoji: '📦' },
          { type: 'ci', section: 'CI/CD', emoji: '👷' },
          { type: 'chore', hidden: true }
        ],

        template: repoInfo ? {
          commitUrl: `https://${repoInfo.host}/${repoInfo.owner}/${repoInfo.repo}/commit/{{hash}}`,
          compareUrl: `https://${repoInfo.host}/${repoInfo.owner}/${repoInfo.repo}/compare/{{previousTag}}...{{currentTag}}`,
          issueUrl: `https://${repoInfo.host}/${repoInfo.owner}/${repoInfo.repo}/issues/{{id}}`,
          prUrl: `https://${repoInfo.host}/${repoInfo.owner}/${repoInfo.repo}/pull/{{id}}`
        } : {},

        exclude: {
          types: ['style', 'chore'],
          scopes: [],
          commits: []
        }
      };

      // 保存配置
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

      console.log(chalk.green('\n✅ 配置文件已创建: ') + chalk.cyan('.changelogrc.json'));
      console.log(chalk.gray('\n你可以手动编辑此文件来自定义配置'));
    } catch (error) {
      console.error(chalk.red('❌ 初始化失败:'), error.message);
      process.exit(1);
    }
  });

/**
 * 生成 CHANGELOG
 */
program
  .command('generate')
  .description('生成完整的 CHANGELOG.md')
  .option('-f, --from <tag>', '起始标签')
  .option('-t, --to <tag>', '结束标签', 'HEAD')
  .option('-o, --output <file>', '输出文件', 'CHANGELOG.md')
  .option('--all', '包含所有历史提交')
  .option('--format <format>', '输出格式 (markdown|html)', 'markdown')
  .action(async (options) => {
    const spinner = ora('正在生成 CHANGELOG...').start();

    try {
      const cwd = process.cwd();

      // 加载配置
      const configLoader = new ConfigLoader(cwd);
      const config = await configLoader.load();

      // 初始化模块
      const analyzer = new GitAnalyzer(cwd);
      const classifier = new CommitClassifier(config);
      const generator = new ChangelogGenerator(config);

      // 检查是否是 Git 仓库
      if (!(await analyzer.isGitRepository())) {
        spinner.fail('当前目录不是 Git 仓库');
        process.exit(1);
      }

      // 获取提交
      spinner.text = '正在分析 Git 提交历史...';
      const commits = await analyzer.getCommits({
        from: options.from,
        to: options.to
      });

      if (commits.length === 0) {
        spinner.warn('没有找到提交记录');
        return;
      }

      spinner.text = `正在分类 ${commits.length} 个提交...`;

      // 分类提交
      const classified = classifier.classify(commits);

      // 创建版本数据
      const versionData = generator.createVersionData('Unreleased', classified);

      // 生成 CHANGELOG
      spinner.text = '正在生成 CHANGELOG...';
      let changelog;
      let outputPath;

      if (options.format === 'html') {
        // 使用 HTML 导出器
        const htmlExporter = new HTMLExporter(config);
        changelog = htmlExporter.export({
          title: 'Changelog',
          versions: [versionData],
          stats: classified.stats
        });

        // 默认输出为 .html 文件
        outputPath = path.join(cwd, options.output.replace(/\.md$/, '.html'));
      } else {
        // 默认 Markdown 格式
        changelog = await generator.generate({
          versions: [versionData]
        });
        outputPath = path.join(cwd, options.output);
      }

      // 保存文件
      await fs.writeFile(outputPath, changelog, 'utf-8');

      spinner.succeed(chalk.green(`CHANGELOG 已生成: ${path.basename(outputPath)}`));

      // 显示统计信息
      console.log(chalk.cyan('\n📊 统计信息:'));
      console.log(`  总提交数: ${classified.stats.total}`);
      console.log(`  已包含: ${classified.stats.included}`);
      console.log(`  已排除: ${classified.stats.excluded}`);
      console.log(`  破坏性变更: ${classified.stats.breaking}`);
      console.log(`  贡献者: ${classified.stats.authors.length} 人`);

      // 显示类型分布
      console.log(chalk.cyan('\n📈 提交类型分布:'));
      Object.entries(classified.stats.byType).forEach(([type, count]) => {
        const typeConfig = classifier.getTypeConfig(type);
        const emoji = typeConfig?.emoji || '📝';
        console.log(`  ${emoji} ${type}: ${count}`);
      });
    } catch (error) {
      spinner.fail('生成失败');
      console.error(chalk.red('\n错误:'), error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

/**
 * 更新 CHANGELOG（增量）
 */
program
  .command('update')
  .description('更新 CHANGELOG.md（增量更新）')
  .option('-f, --from <tag>', '起始标签（默认为最新标签）')
  .option('-o, --output <file>', 'CHANGELOG 文件', 'CHANGELOG.md')
  .option('--format <format>', '输出格式 (markdown|html)', 'markdown')
  .action(async (options) => {
    const spinner = ora('正在更新 CHANGELOG...').start();

    try {
      const cwd = process.cwd();
      const configLoader = new ConfigLoader(cwd);
      const config = await configLoader.load();

      const analyzer = new GitAnalyzer(cwd);
      const classifier = new CommitClassifier(config);
      const generator = new ChangelogGenerator(config);

      // 获取最新标签作为起点
      let fromTag = options.from;
      if (!fromTag) {
        const tags = await analyzer.getTags();
        if (tags.length > 0) {
          fromTag = tags[tags.length - 1];
        }
      }

      spinner.text = '正在获取新提交...';
      const commits = await analyzer.getCommits({
        from: fromTag,
        to: 'HEAD'
      });

      if (commits.length === 0) {
        spinner.warn('没有新的提交');
        return;
      }

      spinner.text = `正在分类 ${commits.length} 个新提交...`;
      const classified = classifier.classify(commits);

      const versionData = generator.createVersionData('Unreleased', classified);

      // 更新 CHANGELOG
      const changelogPath = path.join(cwd, options.output);
      const updated = await generator.updateExisting(changelogPath, versionData);

      await generator.save(changelogPath, updated);

      spinner.succeed(chalk.green('CHANGELOG 已更新'));

      console.log(chalk.cyan(`\n新增 ${commits.length} 个提交到 [Unreleased] 区域`));
    } catch (error) {
      spinner.fail('更新失败');
      console.error(chalk.red('\n错误:'), error.message);
      process.exit(1);
    }
  });

/**
 * 发布版本
 */
program
  .command('release')
  .description('发布新版本（将 Unreleased 转换为正式版本）')
  .option('-v, --version <version>', '版本号（自动或手动指定）')
  .option('-d, --date <date>', '发布日期（默认今天）')
  .option('-o, --output <file>', 'CHANGELOG 文件', 'CHANGELOG.md')
  .option('--github-release', '创建 GitHub Release')
  .option('--github-token <token>', 'GitHub Personal Access Token')
  .option('--draft', '创建草稿 Release')
  .option('--prerelease', '标记为预发布版本')
  .action(async (options) => {
    const spinner = ora('正在发布版本...').start();

    try {
      const cwd = process.cwd();
      const configLoader = new ConfigLoader(cwd);
      const config = await configLoader.load();

      const analyzer = new GitAnalyzer(cwd);
      const generator = new ChangelogGenerator(config);

      let version = options.version;

      // 如果未指定版本，自动确定
      if (!version) {
        spinner.text = '正在确定版本号...';

        const currentVersion = await analyzer.getCurrentVersion() || '0.0.0';

        // 询问用户
        const { versionType } = await inquirer.prompt([
          {
            type: 'list',
            name: 'versionType',
            message: `当前版本: ${currentVersion}，选择版本类型:`,
            choices: [
              { name: `Patch (${currentVersion} -> ${require('semver').inc(currentVersion, 'patch')})`, value: 'patch' },
              { name: `Minor (${currentVersion} -> ${require('semver').inc(currentVersion, 'minor')})`, value: 'minor' },
              { name: `Major (${currentVersion} -> ${require('semver').inc(currentVersion, 'major')})`, value: 'major' },
              { name: '手动输入', value: 'custom' }
            ]
          }
        ]);

        if (versionType === 'custom') {
          const { customVersion } = await inquirer.prompt([
            {
              type: 'input',
              name: 'customVersion',
              message: '输入版本号:',
              validate: (input) => {
                return require('semver').valid(input) ? true : '请输入有效的语义化版本号';
              }
            }
          ]);
          version = customVersion;
        } else {
          version = require('semver').inc(currentVersion, versionType);
        }
      }

      spinner.text = `正在发布版本 ${version}...`;

      // 发布版本
      const changelogPath = path.join(cwd, options.output);
      const released = await generator.releaseVersion(
        changelogPath,
        version,
        options.date
      );

      await generator.save(changelogPath, released);

      spinner.succeed(chalk.green(`版本 ${version} 已发布`));

      // 创建 GitHub Release（如果指定）
      if (options.githubRelease) {
        spinner.start('正在创建 GitHub Release...');

        try {
          const remoteUrl = await analyzer.getRemoteUrl();
          const repoInfo = analyzer.parseRemoteUrl(remoteUrl);

          if (!repoInfo) {
            spinner.warn('无法解析 GitHub 仓库信息，跳过 GitHub Release 创建');
          } else {
            // 初始化 GitHub Integration
            const github = new GitHubIntegration({
              token: options.githubToken || process.env.GITHUB_TOKEN,
              owner: repoInfo.owner,
              repo: repoInfo.repo
            });

            // 验证 Token
            const tokenValid = await github.validateToken();
            if (!tokenValid) {
              spinner.fail('GitHub Token 无效，请提供有效的 GITHUB_TOKEN');
              console.log(chalk.yellow('\n提示: 使用 --github-token 选项或设置 GITHUB_TOKEN 环境变量'));
            } else {
              // 读取当前 CHANGELOG 内容，提取该版本的内容
              const changelogContent = await fs.readFile(changelogPath, 'utf-8');
              const lines = changelogContent.split('\n');
              let versionContent = [];
              let inVersion = false;

              for (const line of lines) {
                if (line.match(new RegExp(`^##\\s+\\[${version}\\]`))) {
                  inVersion = true;
                  continue;
                }
                if (inVersion && line.match(/^##\s+\[/)) {
                  break;
                }
                if (inVersion) {
                  versionContent.push(line);
                }
              }

              const releaseBody = versionContent.join('\n').trim();

              // 创建 Release
              const release = await github.createRelease({
                tagName: `v${version}`,
                name: `Release ${version}`,
                body: releaseBody,
                draft: options.draft || false,
                prerelease: options.prerelease || false
              });

              spinner.succeed(chalk.green('GitHub Release 已创建'));
              console.log(chalk.cyan(`Release URL: ${release.url}`));
            }
          }
        } catch (error) {
          spinner.fail('创建 GitHub Release 失败');
          console.error(chalk.red('错误:'), error.message);
        }
      }

      console.log(chalk.cyan('\n下一步:'));
      console.log(`  1. 审查 CHANGELOG.md`);
      if (!options.githubRelease) {
        console.log(`  2. 提交变更: git add CHANGELOG.md && git commit -m "chore(release): ${version}"`);
        console.log(`  3. 创建标签: git tag v${version}`);
        console.log(`  4. 推送: git push && git push --tags`);
      } else {
        console.log(`  2. 提交变更: git add CHANGELOG.md && git commit -m "chore(release): ${version}"`);
        console.log(`  3. 推送: git push`);
      }
    } catch (error) {
      spinner.fail('发布失败');
      console.error(chalk.red('\n错误:'), error.message);
      process.exit(1);
    }
  });

/**
 * 预览
 */
program
  .command('preview')
  .description('预览 Unreleased 的内容')
  .action(async () => {
    try {
      const cwd = process.cwd();
      const changelogPath = path.join(cwd, 'CHANGELOG.md');

      const content = await fs.readFile(changelogPath, 'utf-8');

      // 提取 Unreleased 区域
      const lines = content.split('\n');
      let inUnreleased = false;
      let preview = [];

      for (const line of lines) {
        if (line.match(/^##\s+\[Unreleased\]/)) {
          inUnreleased = true;
          preview.push(line);
          continue;
        }

        if (inUnreleased) {
          if (line.match(/^##\s+\[/)) {
            break;
          }
          preview.push(line);
        }
      }

      if (preview.length === 0) {
        console.log(chalk.yellow('没有 Unreleased 的内容'));
        return;
      }

      console.log(chalk.cyan('📋 Unreleased 内容预览:\n'));
      console.log(preview.join('\n'));
    } catch (error) {
      console.error(chalk.red('预览失败:'), error.message);
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
