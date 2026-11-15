#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import { handleMcpRequest, executeTool, MCP_TOOLS } from '../mcp/protocol.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UI_DIR = path.resolve(__dirname, '../../../ui');

const args = process.argv.slice(2);
const command = args[0] || 'serve';

async function main() {
  if (args.includes('--help') || args.includes('-h') || command === 'help') {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('omnimcp v1.0.0 (1nsharma-labs)');
    process.exit(0);
  }

  // 1. Stdio Mode (For Claude Desktop, Cursor, Windsurf, Cline)
  if (command === 'stdio') {
    startStdioMode();
    return;
  }

  // 2. Direct Tool Execution from CLI
  if (command === 'run-tool') {
    const toolName = args[1];
    const toolArgs = args[2] ? JSON.parse(args[2]) : {};
    const res = await executeTool(toolName, toolArgs);
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }

  // 3. HTTP Server + Web UI Playground Mode (Default)
  const port = parseInt(process.env.PORT || args[1] || '9090', 10);
  startHttpServer(port);
}

/**
 * MCP over Stdio (JSON-RPC line by line)
 */
function startStdioMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    if (!line.trim()) return;
    try {
      const req = JSON.parse(line);
      const res = await handleMcpRequest(req);
      process.stdout.write(JSON.stringify(res) + '\n');
    } catch (err) {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error', data: err.message }
      }) + '\n');
    }
  });
}

/**
 * MCP HTTP & Web UI Server
 */
function startHttpServer(port = 9090) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 1. Health
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy', service: 'OmniMCP', version: '1.0.0' }));
      return;
    }

    // 2. Tools Catalog API
    if (pathname === '/api/tools' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ tools: MCP_TOOLS }));
      return;
    }

    // 3. MCP JSON-RPC over HTTP POST
    if (pathname === '/mcp' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          const response = await handleMcpRequest(payload);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // 4. Direct Tool Runner for UI Playground
    if (pathname === '/api/execute' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { tool, args = {} } = JSON.parse(body);
          const result = await executeTool(tool, args);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, result }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // 5. Serve UI Dashboard
    if (pathname === '/' || pathname === '/dashboard' || pathname.startsWith('/ui')) {
      const filePath = path.join(UI_DIR, 'index.html');
      if (fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(filePath, 'utf-8'));
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  server.listen(port, () => {
    console.log(`
  ==============================================================
    🔮 OmniMCP — Universal MCP Hub & Autonomous Agent Workspace
    🏢 Organization: 1nsharma-labs
  ==============================================================
  🚀 Web UI & Playground: http://localhost:${port}/
  📡 MCP HTTP Endpoint:  http://localhost:${port}/mcp
  🩺 Health Endpoint:    http://localhost:${port}/health
  📟 Stdio Mode:         Run 'npx @1nsharma-labs/omnimcp stdio'
  ==============================================================
    `);
  });

  return server;
}

function printHelp() {
  console.log(`
OmniMCP — The Universal MCP Hub & Autonomous Agent Workspace for Desktop, Mobile & CLI

USAGE:
  omnimcp [command] [options]

COMMANDS:
  serve [port]                Start HTTP MCP server and interactive Web UI (default port: 9090)
  stdio                       Start standard MCP JSON-RPC server over stdio for Claude Desktop / Cursor
  run-tool <name> [argsJson]  Run an MCP tool directly from the terminal
  help                        Show help information

EXAMPLES:
  # Run for Claude Desktop or Cursor:
  omnimcp stdio

  # Run Web Playground:
  omnimcp serve 9090

  # Test a mobile tool:
  omnimcp run-tool mobile_devices
  `);
}

// Auto start if invoked directly
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('cli.js') || 
  process.argv[1].endsWith('omnimcp')
);

if (isDirectExecution) {
  main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
  });
}

export { startHttpServer, startStdioMode };
