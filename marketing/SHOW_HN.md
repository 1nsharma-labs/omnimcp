# Hacker News Launch: Show HN: OmniMCP – Universal MCP Hub for Desktop, Mobile ADB, Workspace, and Memory

**Title:** Show HN: OmniMCP – Universal MCP Hub for Desktop, Mobile ADB, Workspace, and Memory

**URL / Text:**
Hey HN! Amit here from 1nsharma-labs.

Like many developers experimenting with Claude Desktop, Cursor, and autonomous AI agents, we found ourselves configuring five different MCP (Model Context Protocol) servers just to give the agent basic capabilities: one for filesystem, one for memory, another for running commands, and ad-hoc scripts for mobile device testing.

We built **OmniMCP** – an open-source, zero-dependency universal MCP Hub written in pure Node.js ESM. It runs over standard stdio (for Claude Desktop / Cursor) and HTTP/SSE (for web & cloud agents) and packages 4 core toolpacks:

1. 📱 **Mobile Automation:** Direct ADB driver to list attached Android phones/emulators, tap coordinates, type text, and capture screenshots.
2. 📁 **Workspace Intelligence:** Fast directory tree, regex code search, and token budget calculation.
3. 💻 **Desktop OS Telemetry:** CPU, RAM, platform architecture, and native OS notifications.
4. 🧠 **Persistent Memory Mesh:** Native Node 24 SQLite storage for cross-agent scratchpad and memory recall.

Repo: https://github.com/1nsharma-labs/omnimcp
Live Interactive Playground Demo: https://1nsharma-labs.github.io/omnimcp/

Quick test with Claude Desktop:
```json
{
  "mcpServers": {
    "omnimcp": {
      "command": "npx",
      "args": ["-y", "@1nsharma-labs/omnimcp", "stdio"]
    }
  }
}
```

Or run the interactive visual inspector on port 9090:
`npx @1nsharma-labs/omnimcp serve 9090`

Would love your thoughts, tool suggestions, and feedback!
