import assert from 'node:assert';

import { handleMcpRequest, executeTool, MCP_TOOLS } from '../core/src/mcp/protocol.js';
import { globalMobileDriver } from '../core/src/tools/mobile/driver.js';
import { globalWorkspaceExplorer } from '../core/src/tools/workspace/explorer.js';
import { globalDesktopSystem } from '../core/src/tools/desktop/system.js';
import { globalMemoryMesh } from '../core/src/tools/memory/mesh.js';
import { LicenseVerifier } from '../ee/license/verifier.js';

console.log('🧪 Starting OmniMCP Comprehensive Test Suite...\n');

// 1. MCP JSON-RPC Protocol Test
console.log('Test 1: Model Context Protocol JSON-RPC 2.0 Spec Compliance');
const initReq = { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} };
const initRes = await handleMcpRequest(initReq);
assert.strictEqual(initRes.result.serverInfo.name, 'OmniMCP');
assert.strictEqual(initRes.result.protocolVersion, '2024-11-05');
console.log('  ✅ MCP initialize passed: OmniMCP v1.0.0 protocol compliant');

const listReq = { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} };
const listRes = await handleMcpRequest(listReq);
assert.ok(listRes.result.tools.length >= 10);
console.log('  ✅ MCP tools/list passed: Exposing', listRes.result.tools.length, 'tools');

// 2. Mobile Toolpack Test
console.log('\nTest 2: Mobile Android / Emulator Toolpack');
const devices = globalMobileDriver.getDevices();
assert.ok(devices.length > 0);
console.log('  ✅ Mobile devices listed:', devices[0].model, `(${devices[0].type})`);

const tapRes = globalMobileDriver.tap(100, 200);
assert.strictEqual(tapRes.success, true);
console.log('  ✅ Mobile touch tap passed at (100, 200)');

const typeRes = globalMobileDriver.type('Test Hello');
assert.strictEqual(typeRes.success, true);
console.log('  ✅ Mobile text typing passed');

// 3. Workspace Intelligence Toolpack Test
console.log('\nTest 3: Workspace Explorer & Token Budget Engine');
const tree = globalWorkspaceExplorer.getTree(process.cwd(), 1);
assert.ok(tree.length > 0);
console.log('  ✅ Workspace tree generated:', tree.length, 'top-level entries');

const budget = globalWorkspaceExplorer.calculateTokenBudget('Hello world sample prompt for token testing', 128000);
assert.ok(budget.estimatedTokens > 0);
assert.strictEqual(budget.isWithinBudget, true);
console.log('  ✅ Token budget calculation passed:', budget.estimatedTokens, 'tokens estimated');

// 4. Desktop OS Toolpack Test
console.log('\nTest 4: Desktop OS System Telemetry');
const sysInfo = globalDesktopSystem.getSystemInfo();
assert.ok(sysInfo.cpuCores > 0);
assert.ok(sysInfo.memory.totalGB > 0);
console.log('  ✅ Desktop telemetry passed: OS', sysInfo.platform, 'with', sysInfo.cpuCores, 'cores,', sysInfo.memory.totalGB, 'GB RAM');

// 5. Memory Mesh Test (Native SQLite)
console.log('\nTest 5: Persistent AI Agent Memory Mesh (Native SQLite)');
const saveRes = globalMemoryMesh.save('test_user_goal', { goal: 'Ship open-source software and build wealth' }, 'strategy', 'agent_alpha', ['finops', 'ai']);
assert.strictEqual(saveRes.success, true);

const recallRes = globalMemoryMesh.recall('test_user_goal');
assert.strictEqual(recallRes.found, true);
assert.strictEqual(recallRes.value.goal, 'Ship open-source software and build wealth');
console.log('  ✅ Memory save & recall verified via persistent SQLite ledger');

// 6. MCP tools/call Dispatcher Integration Test
console.log('\nTest 6: MCP tools/call End-to-End Dispatch');
const callReq = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'desktop_info',
    arguments: {}
  }
};
const callRes = await handleMcpRequest(callReq);
assert.strictEqual(callRes.result.content[0].type, 'text');
assert.ok(callRes.result.content[0].text.includes('cpuCores'));
console.log('  ✅ MCP tools/call returned valid content payload');

// 7. Enterprise License Verifier Test
console.log('\nTest 7: Offline Cryptographic License Verifier (BSL 1.1)');
const verifier = new LicenseVerifier('test-omni-secret');
const validKey = verifier.generateKey('AcmeAgents', 365, 'ENT');
const res = verifier.verifyKey(validKey);
assert.strictEqual(res.valid, true);
assert.strictEqual(res.organization, 'ACMEAGENTS');
assert.strictEqual(res.tier, 'ENTERPRISE');
console.log('  ✅ Enterprise cryptographic key verification passed');

console.log('\n🎉 ALL OMNIMCP TESTS PASSED SUCCESSFULLY! 100% Operational.\n');
