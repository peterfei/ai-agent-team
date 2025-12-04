#!/usr/bin/env node

/**
 * Test script for add_message functionality
 * Run: node test-add-message.js
 */

const { MCPServer } = require('./dist/server.js');
const { dbManager } = require('./dist/database/db.js');

async function test() {
    console.log('Starting add_message test...\n');

    const server = new MCPServer(dbManager);
    const threadManager = server.getThreadManager();

    try {
        // 1. Create a test thread
        console.log('1. Creating test thread...');
        const createResult = await threadManager.createThread({
            title: 'Test Thread for Messages',
            description: 'Testing message recording',
            switchTo: true
        });
        console.log(`✓ Thread created: ${createResult.thread.id}\n`);

        // 2. Add a user message
        console.log('2. Adding user message...');
        const userMessage = await threadManager.addMessageToThread(
            createResult.thread.id,
            'user',
            '这是一条用户消息'
        );
        console.log(`✓ User message added: ${userMessage.id}\n`);

        // 3. Add an assistant message
        console.log('3. Adding assistant message...');
        const assistantMessage = await threadManager.addMessageToThread(
            createResult.thread.id,
            'assistant',
            '这是一条助手消息'
        );
        console.log(`✓ Assistant message added: ${assistantMessage.id}\n`);

        // 4. Get thread with messages
        console.log('4. Retrieving thread with messages...');
        const { thread, messages } = await threadManager.getThread(
            createResult.thread.id,
            true // includeMessages
        );

        console.log(`✓ Thread retrieved:`);
        console.log(`  - Title: ${thread.title}`);
        console.log(`  - Message Count: ${thread.messageCount}`);
        console.log(`  - Messages retrieved: ${messages.length}\n`);

        // 5. Display messages
        console.log('5. Messages in thread:');
        messages.forEach((msg, idx) => {
            console.log(`  [${idx + 1}] ${msg.role}: ${msg.content}`);
        });

        console.log('\n✓ All tests passed!');

    } catch (error) {
        console.error('✗ Test failed:', error.message);
        process.exit(1);
    }
}

test();
