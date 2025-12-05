const { MCPServer } = require('./dist/server.js');
const { dbManager } = require('./dist/database/db.js');

async function test() {
    const server = new MCPServer(dbManager);
    const threadManager = server.getThreadManager();

    // Create a dummy thread so list isn't empty
    await threadManager.createThread({ title: 'Test List Format', switchTo: false });

    const result = await threadManager.listThreads({});
    console.log('--- START OUTPUT ---');
    console.log(result.message);
    console.log('--- END OUTPUT ---');
}

test();