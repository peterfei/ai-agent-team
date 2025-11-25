/**
 * 新的文档生成器 - 使用HTML方式避免中文乱码
 */

const { generateManualHTML } = require('./simple-doc-generator');

/**
 * 生成软件说明书
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<string>} 生成的HTML文件路径
 */
async function generateManual(projectInfo, outputDir) {
  try {
    // 使用HTML生成器避免中文乱码问题
    return await generateManualHTML(projectInfo, outputDir);
  } catch (error) {
    throw new Error(`生成软件说明书失败: ${error.message}`);
  }
}

module.exports = {
  generateManual
};