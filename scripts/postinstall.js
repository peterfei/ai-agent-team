#!/usr/bin/env node

/**
 * AI Agent Team npm postinstall script
 * 提示用户运行初始化命令
 */

console.log('\x1b[36m%s\x1b[0m', '╔══════════════════════════════════════════════════════════════╗');
console.log('\x1b[36m%s\x1b[0m', '║                                                              ║');
console.log('\x1b[36m%s\x1b[0m', '║           🤖 AI Agent Team successfully installed!           ║');
console.log('\x1b[36m%s\x1b[0m', '║                                                              ║');
console.log('\x1b[36m%s\x1b[0m', '╚══════════════════════════════════════════════════════════════╝');
console.log();
console.log('\x1b[33m%s\x1b[0m', 'To complete the setup and choose your installation context:');
console.log();
console.log('\x1b[32m%s\x1b[0m', '  Run:  npx ai-agent-team init');
console.log();
console.log('  This will allow you to choose between:');
console.log('  1. Global installation (User Home) - Recommended for personal use');
console.log('  2. Local installation (Current Project) - Recommended for teams');
console.log();