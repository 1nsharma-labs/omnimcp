<h1 align="center">🔮 OmniMCP</h1>

<p align="center">
  <b>The Universal Model Context Protocol (MCP) Hub & Autonomous Agent Workspace</b><br>
  Equip Claude Desktop, Cursor, Cline, and custom AI agents with mobile device control, desktop OS telemetry, workspace code intelligence, and persistent SQLite memory mesh.
</p>

<p align="center">
  <a href="https://github.com/1nsharma-labs/omnimcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License"></a>
  <a href="https://github.com/1nsharma-labs/omnimcp/blob/main/ee/LICENSE-EE"><img src="https://img.shields.io/badge/EE_License-BSL_1.1-purple.svg" alt="EE License"></a>
  <a href="https://github.com/sponsors/1nsharma"><img src="https://img.shields.io/badge/Sponsor-GitHub_Sponsors-pink.svg" alt="Sponsor"></a>
  <a href="https://1nsharma-labs.github.io/omnimcp/"><img src="https://img.shields.io/badge/Live_Demo-Interactive_Playground-c026d3.svg" alt="Live Demo"></a>
</p>

---

## ⚡ What is OmniMCP?

The **Model Context Protocol (MCP)** is the industry standard created by Anthropic to give AI agents access to tools, databases, and environments. 

However, setting up and maintaining separate MCP servers for mobile testing, filesystem searching, process management, and agent memory requires hours of configuration and fragile dependencies.

**OmniMCP** is a lightweight, zero-dependency, unified MCP Hub that exposes a complete toolkit over both **stdio** (for Claude Desktop / Cursor) and **HTTP/SSE** (for web & cloud agents):

1. 📱 **Mobile Automation Toolpack (`mobile_*`):** Control attached physical Android phones or emulators via ADB (tap coordinates, type text, capture screen buffers, list devices).
2. 📁 **Workspace Intelligence (`workspace_*`):** High-speed codebase tree generation, regex code search, and exact token budget tracking to prevent context window overflow.
3. 💻 **Desktop OS Telemetry (`desktop_*`):** Host CPU, memory usage, platform architecture, and native desktop notifications.
4. 🧠 **Persistent SQLite Memory Mesh (`memory_*`):** Native Node 24 SQLite storage for cross-agent scratchpads, decisions, and long-term memory retrieval.
5. 🎛️ **Web UI Playground:** Interactive in-browser tool tester running on port 9090.

---

## 🌐 Live Interactive Playground Demo

Test every MCP tool visually in your browser without installing anything:
👉 [**https://1nsharma-labs.github.io/omnimcp/**](https://1nsharma-labs.github.io/omnimcp/)

---

## 🚀 60-Second Setup for Claude Desktop & Cursor

### Step 1: Add to Claude Desktop Config

Open your `claude_desktop_config.json`:
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add OmniMCP with zero installation via `npx`:

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

Restart Claude Desktop, and all 11+ mobile, workspace, desktop, and memory tools will instantly appear in Claude's tool picker!

---

## 💻 Standalone Web Server & Inspector Mode

Run OmniMCP as a background HTTP daemon and visual tool tester:

```bash
npx @1nsharma-labs/omnimcp serve 9090
```

* **Interactive Web Playground:** `http://localhost:9090/`
* **MCP HTTP Endpoint:** `http://localhost:9090/mcp`
* **Health Check:** `http://localhost:9090/health`

---

## 🛠️ Tool Catalog Reference

| Tool Name | Category | Description |
| :--- | :--- | :--- |
| `mobile_devices` | Mobile | Lists attached physical Android devices and emulators |
| `mobile_tap` | Mobile | Performs touch screen tap at (x, y) coordinates |
| `mobile_type` | Mobile | Inputs text into focused keyboard field on phone |
| `mobile_screenshot` | Mobile | Captures frame buffer from device |
| `workspace_tree` | Workspace | Generates file tree respecting .gitignore rules |
| `workspace_search` | Workspace | High-speed regex search across all codebase files |
| `workspace_tokens` | Workspace | Calculates token count to avoid context limits |
| `desktop_info` | Desktop | Returns CPU model, cores, RAM usage, and OS |
| `desktop_notify` | Desktop | Dispatches native OS toast/popup notification |
| `memory_save` | Memory | Persistently stores insight in cross-agent SQLite mesh |
| `memory_recall` | Memory | Retrieves stored memories by exact key or keyword query |

---

## 💼 Dual Licensing & Open-Core Model

* **Community Core (`/core`):** Licensed under **Apache License 2.0**. 100% free for individual developers and teams running up to 5 concurrent agent workers.
* **Enterprise Edition (`/ee`):** Licensed under **Business Source License (BSL 1.1)**. Includes unlimited multi-agent fleet orchestration, remote cloud mobile device farms, and dedicated SLAs.

See [PRICING.md](PRICING.md) for commercial tiers.

---

## 🤝 Support & Enterprise Inquiries

* **Direct Personal Email:** [tech@mowglai.com](mailto:tech@mowglai.com)
* **Enterprise Inquiries & Bounties:** [polar.sh/1nsharma-labs](https://polar.sh/1nsharma-labs)
* **Founder & Lead:** **Amit Sharma** (@1nsharma)
* **GitHub Sponsors:** [github.com/sponsors/1nsharma](https://github.com/sponsors/1nsharma)
* **Polar.sh:** [polar.sh/1nsharma-labs](https://polar.sh/1nsharma-labs)

---

## 🌐 The 1nsharma-labs Open-Source Suite

* 🔮 [**OmniMCP**](https://github.com/1nsharma-labs/omnimcp): Universal MCP Hub & Autonomous Agent Workspace.
* 🛡️ [**TokenArmor**](https://github.com/1nsharma-labs/tokenarmor): AI Gateway & Token FinOps Firewall.
* ☸️ [**KubePrune**](https://github.com/1nsharma-labs/kubeprune): Kubernetes Over-Provisioning & Pod Waste Killer.
* 🏗️ [**DriftArmor**](https://github.com/1nsharma-labs/driftarmor): Terraform Drift Detector & Cloud Cost Firewall.
* 🍃 [**CloudPrune**](https://github.com/1nsharma-labs/cloudprune): AWS & GCP Cloud Waste & Zombie Resource Killer.
* 🔒 [**CompliGuard**](https://github.com/1nsharma-labs/compliguard): Continuous SOC 2 & ISO 27001 Evidence Engine.
* 🔑 [**SecretArmor**](https://github.com/1nsharma-labs/secretarmor): Zero-Trust Secret Sprawl & API Key Leak Firewall.
