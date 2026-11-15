/**
 * OmniMCP Enterprise Multi-Agent Mesh Coordinator
 * Manages concurrent autonomous agent workers, task allocation, and token quotas.
 */
export class MultiAgentMesh {
  constructor(maxAgents = 10) {
    this.maxAgents = maxAgents;
    this.agents = new Map();
  }

  registerAgent(agentId, role, capabilities = []) {
    if (this.agents.size >= this.maxAgents) {
      throw new Error(`Enterprise agent limit reached (${this.maxAgents}). Upgrade license to scale fleet.`);
    }

    const agent = {
      id: agentId,
      role,
      capabilities,
      registeredAt: new Date().toISOString(),
      status: 'idle',
      tasksCompleted: 0
    };

    this.agents.set(agentId, agent);
    return agent;
  }

  listFleet() {
    return Array.from(this.agents.values());
  }
}

export const globalMultiAgentMesh = new MultiAgentMesh();
