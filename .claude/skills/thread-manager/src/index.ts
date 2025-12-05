import { run } from './server';

// This is the main entry point for the MCP Skill.
// When Claude Code starts this skill, it will call the `run` function.
run().catch(error => {
  console.error("Failed to start MCP Server:", error);
  process.exit(1);
});
