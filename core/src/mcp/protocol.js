import { globalMobileDriver } from '../tools/mobile/driver.js';
import { globalWorkspaceExplorer } from '../tools/workspace/explorer.js';
import { globalDesktopSystem } from '../tools/desktop/system.js';
import { globalMemoryMesh } from '../tools/memory/mesh.js';

/**
 * Standard MCP Tools Definitions
 */
export const MCP_TOOLS = [
  // 1. Mobile Tools
  {
    name: 'mobile_devices',
    description: 'Lists all physically attached Android devices and active emulators available for AI interaction.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'mobile_tap',
    description: 'Performs a precise touch screen tap at (x, y) coordinates on target mobile phone.',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'integer', description: 'Screen X coordinate' },
        y: { type: 'integer', description: 'Screen Y coordinate' },
        serial: { type: 'string', description: 'Optional device serial' }
      },
      required: ['x', 'y']
    }
  },
  {
    name: 'mobile_type',
    description: 'Types text into currently focused input field on target mobile phone.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text string to type' },
        serial: { type: 'string', description: 'Optional device serial' }
      },
      required: ['text']
    }
  },
  {
    name: 'mobile_screenshot',
    description: 'Captures a high-resolution screenshot from the mobile device frame buffer.',
    inputSchema: {
      type: 'object',
      properties: {
        serial: { type: 'string', description: 'Optional device serial' }
      }
    }
  },

  // 2. Workspace Tools
  {
    name: 'workspace_tree',
    description: 'Returns clean file directory tree of current workspace, respecting gitignore.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Base directory path' },
        maxDepth: { type: 'integer', description: 'Recursion depth limit' }
      }
    }
  },
  {
    name: 'workspace_search',
    description: 'Searches codebase files using regex text search with matched snippets and line numbers.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Regex query' },
        path: { type: 'string', description: 'Directory path' },
        filePattern: { type: 'string', description: 'Optional file extension filter' }
      },
      required: ['query']
    }
  },
  {
    name: 'workspace_tokens',
    description: 'Calculates exact token budget of text or files to prevent context window overflow.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text string to measure' },
        modelLimit: { type: 'integer', description: 'Context window limit (default 128k)' }
      },
      required: ['text']
    }
  },

  // 3. Desktop Tools
  {
    name: 'desktop_info',
    description: 'Returns host OS info: CPU model, cores, RAM usage, platform, and architecture.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'desktop_notify',
    description: 'Dispatches a native desktop notification popup or system alert to the user.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Notification title' },
        message: { type: 'string', description: 'Notification body' }
      },
      required: ['title', 'message']
    }
  },

  // 4. Memory Mesh Tools
  {
    name: 'memory_save',
    description: 'Persistently saves an insight, decision, variable, or step into the cross-agent SQLite memory mesh.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Unique memory key' },
        value: { type: 'string', description: 'Memory payload (string or JSON)' },
        category: { type: 'string', description: 'Category (e.g. auth, api, plan)' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Searchable tags' }
      },
      required: ['key', 'value']
    }
  },
  {
    name: 'memory_recall',
    description: 'Retrieves stored memories by exact key or keyword search from cross-agent ledger.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Exact key or keyword query' }
      },
      required: ['query']
    }
  }
];

/**
 * Handle incoming MCP JSON-RPC 2.0 Request
 */
export async function handleMcpRequest(request) {
  const { id, method, params } = request;

  // 1. Initialize
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        },
        serverInfo: {
          name: 'OmniMCP',
          version: '1.0.0',
          organization: '1nsharma-labs'
        }
      }
    };
  }

  // 2. Tools List
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: MCP_TOOLS
      }
    };
  }

  // 3. Tools Call
  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params || {};
    try {
      const output = await executeTool(name, args);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: typeof output === 'string' ? output : JSON.stringify(output, null, 2)
            }
          ]
        }
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [{ type: 'text', text: `Tool Error: ${err.message}` }]
        }
      };
    }
  }

  // 4. Ping
  if (method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  };
}

/**
 * Dispatch Tool Execution
 */
export async function executeTool(name, args = {}) {
  switch (name) {
    case 'mobile_devices':
      return globalMobileDriver.getDevices();
    case 'mobile_tap':
      return globalMobileDriver.tap(args.x, args.y, args.serial);
    case 'mobile_type':
      return globalMobileDriver.type(args.text, args.serial);
    case 'mobile_screenshot':
      return globalMobileDriver.screenshot(args.serial);

    case 'workspace_tree':
      return globalWorkspaceExplorer.getTree(args.path || process.cwd(), args.maxDepth || 2);
    case 'workspace_search':
      return globalWorkspaceExplorer.search(args.query, args.path || process.cwd(), args.filePattern);
    case 'workspace_tokens':
      return globalWorkspaceExplorer.calculateTokenBudget(args.text, args.modelLimit || 128000);

    case 'desktop_info':
      return globalDesktopSystem.getSystemInfo();
    case 'desktop_notify':
      return globalDesktopSystem.notify(args.title, args.message);

    case 'memory_save':
      return globalMemoryMesh.save(args.key, args.value, args.category, args.agentId, args.tags);
    case 'memory_recall':
      return globalMemoryMesh.recall(args.query);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
