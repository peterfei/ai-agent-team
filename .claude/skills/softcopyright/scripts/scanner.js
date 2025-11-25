const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// 支持的文件类型及对应的注释模式
const SUPPORTED_EXTENSIONS = {
    '.js': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'javascript',
        priority: 1
    },
    '.jsx': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'jsx',
        priority: 1
    },
    '.ts': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'typescript',
        priority: 2
    },
    '.tsx': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'tsx',
        priority: 2
    },
    '.css': {
        single_line: null,
        multi_line: [/\/\*/, /\*\//],
        language: 'css',
        priority: 3
    },
    '.scss': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'scss',
        priority: 3
    },
    '.html': {
        single_line: null,
        multi_line: [/<!--/, /-->/],
        language: 'html',
        priority: 3
    },
    '.py': {
        single_line: '#',
        multi_line: [/"""/, /"""/],
        language: 'python',
        priority: 1
    },
    '.java': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'java',
        priority: 1
    },
    '.c': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'c',
        priority: 1
    },
    '.cpp': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'cpp',
        priority: 1
    },
    '.h': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'c',
        priority: 1
    },
    '.cs': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'csharp',
        priority: 1
    },
    '.php': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'php',
        priority: 2
    },
    '.rb': {
        single_line: '#',
        multi_line: [/^=begin/, /^=end/],
        language: 'ruby',
        priority: 2
    },
    '.go': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'go',
        priority: 1
    },
    '.rs': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'rust',
        priority: 1
    },
    '.swift': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'swift',
        priority: 1
    },
    '.kt': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'kotlin',
        priority: 1
    },
    '.dart': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'dart',
        priority: 2
    },
    '.vue': {
        single_line: '//',
        multi_line: [/\/\*/, /\*\//],
        language: 'vue',
        priority: 2
    }
};

// 要忽略的目录和文件
const IGNORE_DIRS = [
    'node_modules',
    '.git',
    'build',
    'dist',
    'public',
    'target',
    'bin',
    'obj',
    '__pycache__',
    '.vscode',
    '.idea',
    '.next',
    '.nuxt',
    'coverage',
    '.cache',
    'tmp',
    'temp'
];

const IGNORE_FILES = [
    '.DS_Store',
    '.gitignore',
    'package-lock.json',
    'yarn.lock',
    'README.md',
    'LICENSE',
    '.env',
    '*.min.js',
    '*.min.css',
    '*.map'
];

// 性能优化配置
const OPTIMIZATION_CONFIG = {
    // 是否启用优化
    enabled: process.env.SOFTCOPYRIGHT_NO_OPTIMIZATION !== '1',
    // 是否启用并发
    concurrency: process.env.SOFTCOPYRIGHT_NO_CONCURRENCY !== '1',
    // 并发数量（默认：CPU核心数 * 2）
    concurrencyLimit: parseInt(process.env.SOFTCOPYRIGHT_CONCURRENCY) || require('os').cpus().length * 2,
    // 单个文件最大大小（字节，默认5MB）
    maxFileSize: parseInt(process.env.SOFTCOPYRIGHT_MAX_FILE_SIZE) || 5 * 1024 * 1024,
    // 是否启用缓存
    cache: process.env.SOFTCOPYRIGHT_NO_CACHE !== '1'
};

// 配置文件缓存
const configFileCache = new Map();

/**
 * 获取项目名称（优化版：缓存配置文件）
 * 优先级: package.json > README文件 > 目录名
 * @param {string} projectPath 项目路径
 * @returns {Promise<string>} 项目名称
 */
async function getProjectName(projectPath) {
    try {
        // 1. 尝试从package.json读取
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (await checkFileExists(packageJsonPath)) {
            const packageData = await fs.readJson(packageJsonPath);
            configFileCache.set('package.json', packageData);
            if (packageData.name) {
                console.log(chalk.green(`从package.json读取项目名称: ${packageData.name}`));
                return packageData.name;
            }
        }

        // 2. 尝试从README文件读取
        const readmeFiles = ['README.md', 'README.txt', 'readme.md', 'README'];
        for (const readmeFile of readmeFiles) {
            const readmePath = path.join(projectPath, readmeFile);
            if (await checkFileExists(readmePath)) {
                const readmeContent = await fs.readFile(readmePath, 'utf8');

                // 尝试多种项目名称格式
                const namePatterns = [
                    /^#\s+(.+)/m,                                    // # 项目名称
                    /^#+\s*(.+)\s*(?:项目|Project|App)/im,           // # XXX项目
                    /(?:项目名称|Project Name)[\s:：]+(.+)/i,         // 项目名称: XXX
                    /\*\*(?:项目名称|Project Name)\*\*[\s:：]+(.+)/i, // **项目名称**: XXX
                ];

                for (const pattern of namePatterns) {
                    const nameMatch = readmeContent.match(pattern);
                    if (nameMatch && nameMatch[1]) {
                        const projectName = nameMatch[1].trim()
                            .replace(/项目$/, '')
                            .replace(/Project$/, '')
                            .replace(/App$/, '')
                            .trim();
                        if (projectName) {
                            console.log(chalk.green(`从${readmeFile}读取项目名称: ${projectName}`));
                            return projectName;
                        }
                    }
                }
            }
        }

        // 3. 使用目录名作为最后备选
        const dirName = path.basename(projectPath);
        console.log(chalk.yellow(`使用目录名作为项目名称: ${dirName}`));
        return dirName;

    } catch (error) {
        console.warn(chalk.yellow('读取项目名称失败，使用目录名:'), error.message);
        return path.basename(projectPath);
    }
}

/**
 * 检查文件是否存在（带缓存）
 * @param {string} filePath 文件路径
 * @returns {Promise<boolean>}
 */
async function checkFileExists(filePath) {
    if (OPTIMIZATION_CONFIG.cache && configFileCache.has(filePath)) {
        return configFileCache.get(filePath) !== null;
    }
    const exists = await fs.pathExists(filePath);
    if (OPTIMIZATION_CONFIG.cache) {
        configFileCache.set(filePath, exists);
    }
    return exists;
}

/**
 * 扫描项目（优化版）
 * @param {string} projectPath 项目路径
 * @returns {Promise<Object>} 项目信息
 */
async function scanProject(projectPath) {
    try {
        console.log(chalk.yellow(`🔍 扫描项目: ${projectPath}`));
        console.log(chalk.cyan(`⚡ 性能优化已${OPTIMIZATION_CONFIG.enabled ? '启用' : '禁用'}`));
        if (OPTIMIZATION_CONFIG.enabled) {
            console.log(chalk.cyan(`   - 并发处理: ${OPTIMIZATION_CONFIG.concurrency ? `是 (${OPTIMIZATION_CONFIG.concurrencyLimit}个并发)` : '否'}`));
            console.log(chalk.cyan(`   - 文件大小限制: ${(OPTIMIZATION_CONFIG.maxFileSize / 1024 / 1024).toFixed(1)}MB`));
            console.log(chalk.cyan(`   - 缓存: ${OPTIMIZATION_CONFIG.cache ? '启用' : '禁用'}`));
        }

        // 检查路径是否存在
        if (!await fs.pathExists(projectPath)) {
            throw new Error(`项目路径不存在: ${projectPath}`);
        }

        // 获取项目名称（优先从package.json，其次从README，最后使用目录名）
        const projectName = await getProjectName(projectPath);

        // 查找所有源代码文件（优化版：单次扫描）
        const startScan = Date.now();
        const sourceFiles = await findSourceFilesOptimized(projectPath);
        const scanTime = Date.now() - startScan;
        console.log(chalk.green(`✅ 文件扫描完成，耗时: ${scanTime}ms，找到 ${sourceFiles.length} 个文件`));

        // 分析文件内容（优化版：并发处理）
        const startAnalysis = Date.now();
        const files = [];
        const fileStats = {};
        const languages = new Set();
        let totalLines = 0;
        let totalSize = 0;

        console.log(chalk.cyan('📊 分析源代码文件...'));

        // 过滤超大文件
        const filteredFiles = sourceFiles.filter(filePath => {
            try {
                const stat = fs.statSync(filePath);
                if (stat.size > OPTIMIZATION_CONFIG.maxFileSize) {
                    console.log(chalk.yellow(`⚠️  跳过超大文件 (${(stat.size / 1024 / 1024).toFixed(2)}MB): ${path.relative(projectPath, filePath)}`));
                    return false;
                }
                return true;
            } catch (error) {
                return false;
            }
        });

        // 智能选择并发或串行处理
        // 小项目(<50文件)用串行，大项目(>=50文件)用并发
        const useConcurrency = OPTIMIZATION_CONFIG.concurrency && filteredFiles.length >= 50;

        if (useConcurrency) {
            console.log(chalk.cyan(`   使用并发处理 (${OPTIMIZATION_CONFIG.concurrencyLimit}个并发)...`));
            const { processFilesConcurrently } = require('./utils-optimized');
            const results = await processFilesConcurrently(
                filteredFiles,
                async (filePath) => await analyzeFile(filePath, projectPath),
                OPTIMIZATION_CONFIG.concurrencyLimit
            );

            for (const result of results) {
                if (result.success && result.data) {
                    const fileInfo = result.data;
                    files.push(fileInfo);

                    const ext = fileInfo.extension;
                    fileStats[ext] = (fileStats[ext] || 0) + 1;
                    languages.add(fileInfo.language);
                    totalLines += fileInfo.lines;
                    totalSize += fileInfo.size;
                }
            }
        } else {
            // 串行处理（小项目或禁用并发）
            console.log(chalk.cyan(`   使用串行处理...`));
            for (const filePath of filteredFiles) {
                try {
                    const fileInfo = await analyzeFile(filePath, projectPath);
                    if (fileInfo) {
                        files.push(fileInfo);

                        const ext = fileInfo.extension;
                        fileStats[ext] = (fileStats[ext] || 0) + 1;
                        languages.add(fileInfo.language);
                        totalLines += fileInfo.lines;
                        totalSize += fileInfo.size;
                    }
                } catch (error) {
                    console.warn(chalk.yellow(`⚠️  跳过文件 ${filePath}: ${error.message}`));
                }
            }
        }

        const analysisTime = Date.now() - startAnalysis;
        console.log(chalk.green(`✅ 文件分析完成，耗时: ${analysisTime}ms`));

        // 按优先级和重要性排序文件
        files.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return b.lines - a.lines;
        });

        // 分析项目特征（优化版：使用缓存的配置文件）
        const projectFeatures = await analyzeProjectFeaturesOptimized(files, projectPath);

        const projectInfo = {
            name: projectName,
            path: projectPath,
            files,
            fileStats,
            languages: Array.from(languages),
            totalLines,
            totalSize,
            features: projectFeatures,
            scanTime: new Date().toISOString(),
            performance: {
                scanTime,
                analysisTime,
                totalTime: scanTime + analysisTime,
                filesProcessed: files.length,
                filesSkipped: sourceFiles.length - files.length
            }
        };

        console.log(chalk.green(`✅ 扫描完成: ${files.length} 个文件, ${totalLines} 行代码`));
        console.log(chalk.cyan(`⚡ 总耗时: ${scanTime + analysisTime}ms (扫描: ${scanTime}ms, 分析: ${analysisTime}ms)`));

        return projectInfo;

    } catch (error) {
        throw new Error(`扫描项目失败: ${error.message}`);
    }
}

/**
 * 分析单个文件
 * @param {string} filePath 文件路径
 * @param {string} projectPath 项目路径
 * @returns {Promise<Object|null>} 文件信息
 */
async function analyzeFile(filePath, projectPath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const ext = path.extname(filePath);
        const langInfo = SUPPORTED_EXTENSIONS[ext];

        if (!langInfo) return null;

        const relativePath = path.relative(projectPath, filePath);
        const stats = await fs.stat(filePath);

        // 统计有效代码行数（排除空行和注释）
        const codeLines = countCodeLines(fileContent, ext);

        // 分析文件类型
        return {
            path: relativePath,
            fullPath: filePath,
            extension: ext,
            language: langInfo.language,
            size: stats.size,
            lines: codeLines,
            content: fileContent,
            priority: langInfo.priority
        };
    } catch (error) {
        console.warn(chalk.yellow(`⚠️  分析文件失败 ${filePath}: ${error.message}`));
        return null;
    }
}

/**
 * 查找源代码文件（优化版：单次扫描）
 * @param {string} projectPath 项目路径
 * @returns {Promise<string[]>} 文件路径列表
 */
async function findSourceFilesOptimized(projectPath) {
    const supportedExtensions = Object.keys(SUPPORTED_EXTENSIONS);

    // 合并所有扩展名为一个 glob 模式
    const pattern = supportedExtensions.length === 1
        ? `**/*${supportedExtensions[0]}`
        : `**/*{${supportedExtensions.join(',')}}`;

    try {
        const files = await glob.glob(pattern, {
            cwd: projectPath,
            ignore: [
                ...IGNORE_DIRS.map(dir => `${dir}/**`),
                ...IGNORE_DIRS.map(dir => `**/${dir}/**`),
                ...IGNORE_FILES
            ],
            absolute: true,
            nodir: true
        });

        // 去重并排序
        return [...new Set(files)].sort();
    } catch (error) {
        console.error(chalk.red('文件扫描失败:'), error.message);
        throw error;
    }
}

/**
 * 查找源代码文件（旧版本，保持向后兼容）
 * @param {string} projectPath 项目路径
 * @returns {Promise<string[]>} 文件路径列表
 */
async function findSourceFiles(projectPath) {
    if (OPTIMIZATION_CONFIG.enabled) {
        return findSourceFilesOptimized(projectPath);
    }

    // 原始实现
    const supportedExtensions = Object.keys(SUPPORTED_EXTENSIONS);
    const patterns = supportedExtensions.map(ext => `**/*${ext}`);

    const allFiles = [];

    for (const pattern of patterns) {
        const files = glob.sync(pattern, {
            cwd: projectPath,
            ignore: [
                ...IGNORE_DIRS.map(dir => `${dir}/**`),
                ...IGNORE_FILES
            ],
            absolute: true
        });
        allFiles.push(...files);
    }

    // 去重并排序
    return [...new Set(allFiles)].sort();
}

/**
 * 统计有效代码行数
 * @param {string} content 文件内容
 * @param {string} extension 文件扩展名
 * @returns {number} 有效代码行数
 */
function countCodeLines(content, extension) {
    const langInfo = SUPPORTED_EXTENSIONS[extension];
    if (!langInfo) return 0;

    let lines = content.split('\n');
    let codeLines = 0;
    let inMultiLineComment = false;

    for (let line of lines) {
        const trimmedLine = line.trim();

        // 跳过空行
        if (!trimmedLine) continue;

        // 处理多行注释
        if (langInfo.multi_line) {
            const [startPattern, endPattern] = langInfo.multi_line;

            if (inMultiLineComment) {
                if (endPattern.test(trimmedLine)) {
                    inMultiLineComment = false;
                }
                continue;
            }

            if (startPattern.test(trimmedLine)) {
                if (!endPattern.test(trimmedLine)) {
                    inMultiLineComment = true;
                }
                continue;
            }
        }

        // 跳过单行注释
        if (langInfo.single_line && trimmedLine.startsWith(langInfo.single_line)) {
            continue;
        }

        // 特殊处理HTML注释
        if (extension === '.html' && trimmedLine.startsWith('<!--')) {
            continue;
        }

        codeLines++;
    }

    return codeLines;
}

/**
 * 分析项目特征（优化版：使用缓存）
 * @param {Array} files 文件列表
 * @param {string} projectPath 项目路径
 * @returns {Promise<Object>} 项目特征
 */
async function analyzeProjectFeaturesOptimized(files, projectPath) {
    const features = {
        type: 'unknown',
        frameworks: [],
        buildTools: [],
        packageManagers: [],
        testing: [],
        hasConfigFiles: false,
        hasDocumentation: false,
        hasTests: false
    };

    // 检查package.json（使用缓存）
    let packageJson = configFileCache.get('package.json');
    if (!packageJson) {
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                configFileCache.set('package.json', packageJson);
            } catch (error) {
                // 忽略解析错误
            }
        }
    }

    if (packageJson) {
        features.packageManagers.push('npm');

        if (packageJson.dependencies) {
            const deps = Object.keys(packageJson.dependencies);

            // 检测前端框架
            if (deps.includes('react')) features.frameworks.push('React');
            if (deps.includes('vue')) features.frameworks.push('Vue');
            if (deps.includes('angular')) features.frameworks.push('Angular');
            if (deps.includes('svelte')) features.frameworks.push('Svelte');

            // 检测后端框架
            if (deps.includes('express')) features.frameworks.push('Express');
            if (deps.includes('koa')) features.frameworks.push('Koa');
            if (deps.includes('fastify')) features.frameworks.push('Fastify');
            if (deps.includes('nestjs')) features.frameworks.push('NestJS');

            // 检测构建工具
            if (deps.includes('webpack')) features.buildTools.push('Webpack');
            if (deps.includes('vite')) features.buildTools.push('Vite');
            if (deps.includes('rollup')) features.buildTools.push('Rollup');
            if (deps.includes('parcel')) features.buildTools.push('Parcel');
        }

        if (packageJson.devDependencies) {
            const devDeps = Object.keys(packageJson.devDependencies);

            // 检测测试框架
            if (devDeps.includes('jest')) features.testing.push('Jest');
            if (devDeps.includes('mocha')) features.testing.push('Mocha');
            if (devDeps.includes('vitest')) features.testing.push('Vitest');
            if (devDeps.includes('cypress')) features.testing.push('Cypress');
            if (devDeps.includes('playwright')) features.testing.push('Playwright');
        }
    }

    // 检查其他配置文件
    const configFiles = [
        'tsconfig.json', 'webpack.config.js', 'vite.config.js',
        'babel.config.js', '.eslintrc.js', '.prettierrc',
        'Dockerfile', 'docker-compose.yml', 'requirements.txt',
        'Cargo.toml', 'go.mod', 'pom.xml'
    ];

    for (const configFile of configFiles) {
        if (fs.existsSync(path.join(projectPath, configFile))) {
            features.hasConfigFiles = true;
            break;
        }
    }

    // 检查文档文件
    const docFiles = ['README.md', 'README.txt', 'docs/', 'doc/'];
    for (const docFile of docFiles) {
        if (fs.existsSync(path.join(projectPath, docFile))) {
            features.hasDocumentation = true;
            break;
        }
    }

    // 检查测试文件
    const hasTestFiles = files.some(file =>
        file.path.includes('test') ||
        file.path.includes('spec') ||
        file.path.endsWith('.test.js') ||
        file.path.endsWith('.spec.js')
    );
    features.hasTests = hasTestFiles;

    // 确定项目类型
    const jsFiles = files.filter(f => ['.js', '.jsx', '.ts', '.tsx'].includes(f.extension));
    const pyFiles = files.filter(f => f.extension === '.py');
    const javaFiles = files.filter(f => f.extension === '.java');
    const webFiles = files.filter(f => ['.html', '.css', '.scss', '.vue'].includes(f.extension));

    if (pyFiles.length > jsFiles.length && pyFiles.length > 0) {
        features.type = 'python';
    } else if (javaFiles.length > 0) {
        features.type = 'java';
    } else if (webFiles.length > 0) {
        features.type = 'web';
    } else if (jsFiles.length > 0) {
        features.type = 'javascript';
    }

    return features;
}

/**
 * 分析项目特征（旧版本，保持向后兼容）
 */
function analyzeProjectFeatures(files, projectPath) {
    if (OPTIMIZATION_CONFIG.enabled) {
        return analyzeProjectFeaturesOptimized(files, projectPath);
    }

    // 原始同步实现...
    return analyzeProjectFeaturesOptimized(files, projectPath);
}

module.exports = {
    scanProject,
    findSourceFiles,
    findSourceFilesOptimized,
    countCodeLines,
    analyzeProjectFeatures,
    analyzeProjectFeaturesOptimized,
    SUPPORTED_EXTENSIONS,
    IGNORE_DIRS,
    IGNORE_FILES,
    OPTIMIZATION_CONFIG
};
