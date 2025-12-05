try {
  const path = require.resolve('@modelcontextprotocol/sdk');
  console.log('Main path:', path);
} catch (e) {
  console.error('Error resolving:', e.message);
}
