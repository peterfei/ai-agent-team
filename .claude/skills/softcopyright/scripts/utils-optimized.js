const chalk = require('chalk');

/**
 * 并发处理文件列表
 * @param {Array} items 要处理的项目列表
 * @param {Function} processor 处理函数
 * @param {number} limit 并发限制
 * @returns {Promise<Array>} 处理结果
 */
async function processFilesConcurrently(items, processor, limit = 10) {
    const results = [];
    const executing = [];

    let completed = 0;
    const total = items.length;
    const startTime = Date.now();

    for (const item of items) {
        const promise = (async () => {
            try {
                const result = await processor(item);
                completed++;

                // 显示进度
                if (completed % 100 === 0 || completed === total) {
                    const elapsed = Date.now() - startTime;
                    const rate = completed / (elapsed / 1000);
                    const eta = Math.round((total - completed) / rate);
                    console.log(chalk.cyan(
                        `   进度: ${completed}/${total} (${((completed / total) * 100).toFixed(1)}%) ` +
                        `速率: ${rate.toFixed(1)}文件/秒 预计剩余: ${eta}秒`
                    ));
                }

                return { success: true, data: result, item };
            } catch (error) {
                return { success: false, error, item };
            }
        })();

        results.push(promise);
        executing.push(promise);

        if (executing.length >= limit) {
            await Promise.race(executing);
            executing.splice(0, executing.findIndex(p => p === promise) + 1);
        }
    }

    return Promise.all(results);
}

/**
 * 批量限流器
 */
class PLimit {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.activeCount = 0;
        this.queue = [];
    }

    async run(fn) {
        return new Promise((resolve, reject) => {
            const run = async () => {
                this.activeCount++;
                try {
                    const result = await fn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.activeCount--;
                    if (this.queue.length > 0) {
                        const next = this.queue.shift();
                        next();
                    }
                }
            };

            if (this.activeCount < this.concurrency) {
                run();
            } else {
                this.queue.push(run);
            }
        });
    }
}

/**
 * 创建限流器
 * @param {number} concurrency 并发数
 * @returns {Function} 限流函数
 */
function pLimit(concurrency) {
    const limiter = new PLimit(concurrency);
    return (fn) => limiter.run(fn);
}

/**
 * 延迟函数
 * @param {number} ms 毫秒数
 * @returns {Promise<void>}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 * @param {Function} fn 要执行的函数
 * @param {number} retries 重试次数
 * @param {number} delayMs 重试延迟
 * @returns {Promise<any>}
 */
async function retry(fn, retries = 3, delayMs = 1000) {
    let lastError;

    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < retries - 1) {
                await delay(delayMs);
            }
        }
    }

    throw lastError;
}

/**
 * 分块处理数组
 * @param {Array} array 数组
 * @param {number} size 块大小
 * @returns {Array<Array>} 分块后的数组
 */
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * 批量处理（分批执行）
 * @param {Array} items 项目列表
 * @param {Function} processor 处理函数
 * @param {Object} options 选项
 * @returns {Promise<Array>} 处理结果
 */
async function batchProcess(items, processor, options = {}) {
    const {
        batchSize = 100,
        concurrency = 10,
        onProgress = null
    } = options;

    const chunks = chunk(items, batchSize);
    const results = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunkItems = chunks[i];
        const chunkResults = await processFilesConcurrently(
            chunkItems,
            processor,
            concurrency
        );

        results.push(...chunkResults);

        if (onProgress) {
            onProgress({
                current: (i + 1) * batchSize,
                total: items.length,
                percentage: ((i + 1) / chunks.length) * 100
            });
        }
    }

    return results;
}

module.exports = {
    processFilesConcurrently,
    pLimit,
    delay,
    retry,
    chunk,
    batchProcess
};
