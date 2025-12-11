const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const { Readable } = require('stream');

// 模型文件列表 (Xenova/all-MiniLM-L6-v2 量化版)
const FILES = [
  'config.json',
  'tokenizer.json',
  'tokenizer_config.json',
  'special_tokens_map.json',
  'onnx/model_quantized.onnx'
];

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
// 使用 Hugging Face 镜像，提高国内下载成功率
const BASE_URL = 'https://hf-mirror.com'; 

const OUTPUT_DIR = path.join(__dirname, '../models');

async function downloadFile(file) {
  const url = `${BASE_URL}/${MODEL_ID}/resolve/main/${file}`;
  const destPath = path.join(OUTPUT_DIR, MODEL_ID, file);
  const destDir = path.dirname(destPath);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(destPath)) {
    console.log(`[Skip] ${file} already exists.`);
    return;
  }

  console.log(`[Download] ${url} -> ${destPath}`);

  // 使用 fetch API (Node.js 18+)
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }

  const fileStream = fs.createWriteStream(destPath);
  await pipeline(Readable.fromWeb(response.body), fileStream);
  console.log(`[Success] ${file}`);
}

async function main() {
  console.log('Downloading model files for offline support...');
  console.log(`Target directory: ${OUTPUT_DIR}`);

  try {
    for (const file of FILES) {
      await downloadFile(file);
    }
    console.log('All model files downloaded successfully!');
  } catch (error) {
    console.error('Download failed:', error);
    process.exit(1);
  }
}

main();
