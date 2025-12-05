import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ThreadManager } from './core/thread-manager';
import { DatabaseManager, dbManager } from './database';
import path from 'path';
import fs from 'fs-extra';
import { z } from 'zod';

interface ToolHandler {
  (input: any, threadManager: ThreadManager): Promise<any>;
}

export class MCPServer {
  private mcp: McpServer;
  private threadManager: ThreadManager;
  private toolHandlers: Map<string, ToolHandler>;

  constructor(dbManager: DatabaseManager) {
    // Initialize McpServer with server info
    this.mcp = new McpServer({
      name: 'thread-manager',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });

    this.threadManager = new ThreadManager(dbManager);
    this.toolHandlers = new Map();

    this.registerCoreTools();
  }

  private registerCoreTools() {
    // Dynamically load tools for better modularity
    const toolsDir = path.join(__dirname, 'tools');
    const toolFiles = fs.readdirSync(toolsDir).filter(file =>
      (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
    );

    for (const file of toolFiles) {
      const toolModule = require(path.join(toolsDir, file));
      if (toolModule.toolDefinition && toolModule.toolHandler) {
        const def = toolModule.toolDefinition;
        const handler = toolModule.toolHandler;

        // Convert JSON Schema to Zod schema for MCP SDK
        const inputSchema = this.jsonSchemaToZod(def.inputSchema);

        // Register tool with McpServer
        this.mcp.tool(
          def.name,
          def.description || '',
          inputSchema.shape, // Pass the shape of the ZodObject
          async (input: any) => {
            try {
              // Call the handler with the old invocation format for compatibility
              const result = await handler({ toolName: def.name, input }, this.threadManager);
              
              // console.error(`[DEBUG] Full result from handler for ${def.name}:`, JSON.stringify(result, null, 2));

              let outputText = "";
              if (typeof result.message === 'string') {
                  outputText = result.message;
              } else if (result.message !== undefined && result.message !== null) {
                  outputText = JSON.stringify(result.message, null, 2);
              }

              // Append info if available
              if (result.info) {
                  if (outputText) outputText += "\n\n";
                  outputText += `Info: ${result.info}`;
              }
              
              // Fallback
              if (!outputText) {
                  outputText = JSON.stringify(result, null, 2);
              }

              return {
                content: [
                  {
                    type: 'text' as const,
                    text: outputText
                  }
                ]
              };
            } catch (error: any) {
              console.error(`Error handling tool ${def.name}:`, error);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({ error: error.message || 'Unknown error' }, null, 2)
                  }
                ] as any, // Cast to any
                isError: true
              };
            }
          }
        );

        this.toolHandlers.set(def.name, handler);
        console.log(`Registered MCP Tool: ${def.name}`);
      }
    }
  }

  private jsonSchemaToZod(schema: any): z.ZodObject<any> {
    // Simple conversion from JSON Schema to Zod
    // This is a basic implementation - may need to be enhanced for complex schemas
    const shape: any = {};

    if (schema.properties) {
      for (const [key, prop] of Object.entries<any>(schema.properties)) {
        let zodType: any;

        switch (prop.type) {
          case 'string':
            zodType = z.string();
            if (prop.description) {
              zodType = zodType.describe(prop.description);
            }
            break;
          case 'number':
            zodType = z.number();
            if (prop.description) {
              zodType = zodType.describe(prop.description);
            }
            break;
          case 'boolean':
            zodType = z.boolean();
            if (prop.description) {
              zodType = zodType.describe(prop.description);
            }
            break;
          case 'array':
            if (prop.items?.type === 'string') {
              zodType = z.array(z.string());
            } else {
              zodType = z.array(z.any());
            }
            if (prop.description) {
              zodType = zodType.describe(prop.description);
            }
            break;
          default:
            zodType = z.any();
        }

        // Make optional if not in required array
        if (!schema.required || !schema.required.includes(key)) {
          zodType = zodType.optional();
        }

        shape[key] = zodType;
      }
    }

    return z.object(shape);
  }

  public async start(): Promise<void> {
    console.error('Starting Thread Manager MCP Server...');

    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await this.mcp.connect(transport);

    console.error('Thread Manager MCP Server started and listening for tool calls.');
  }

  public async callTool(toolName: string, input: any): Promise<any> {
      const handler = this.toolHandlers.get(toolName);
      if (!handler) {
          throw new Error(`Tool ${toolName} not found`);
      }
      return handler({ toolName, input }, this.threadManager);
  }

  // For testing purposes, allows direct access to ThreadManager
  public getThreadManager(): ThreadManager {
    return this.threadManager;
  }
}

// Main entry point for the skill (if run directly or by MCP CLI)
const server = new MCPServer(dbManager);

export async function run() {
  await server.start();
}

// If module is imported/required, the server won't start automatically.
// Only starts if directly executed, e.g., `node dist/index.js`
if (require.main === module) {
  run();
}
