import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'agent_memory.db');

/**
 * OmniMCP Persistent AI Agent Memory Mesh (Powered by Native Node 24 SQLite)
 */
export class MemoryMesh {
  constructor(dbPath = DB_PATH) {
    this.db = new DatabaseSync(dbPath);
    this.initTables();
  }

  initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_memories (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        agent_id TEXT DEFAULT 'default_agent',
        tags TEXT DEFAULT '',
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_memories_cat ON agent_memories(category);
    `);
  }

  save(key, value, category = 'general', agentId = 'default_agent', tags = []) {
    const tagStr = Array.isArray(tags) ? tags.join(',') : String(tags);
    const now = new Date().toISOString();
    const valStr = typeof value === 'string' ? value : JSON.stringify(value);

    this.db.prepare(`
      INSERT INTO agent_memories (key, value, category, agent_id, tags, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        category = excluded.category,
        agent_id = excluded.agent_id,
        tags = excluded.tags,
        updated_at = excluded.updated_at
    `).run(key, valStr, category, agentId, tagStr, now);

    return { success: true, key, category, updatedAt: now };
  }

  recall(keyOrQuery) {
    // Exact match lookup
    const direct = this.db.prepare('SELECT * FROM agent_memories WHERE key = ?').get(keyOrQuery);
    if (direct) {
      let parsed = direct.value;
      try { parsed = JSON.parse(direct.value); } catch {}
      return {
        found: true,
        key: direct.key,
        value: parsed,
        category: direct.category,
        agentId: direct.agent_id,
        tags: direct.tags ? direct.tags.split(',') : [],
        updatedAt: direct.updated_at
      };
    }

    // Keyword search match
    const matches = this.db.prepare(`
      SELECT * FROM agent_memories
      WHERE key LIKE ? OR value LIKE ? OR tags LIKE ?
      LIMIT 10
    `).all(`%${keyOrQuery}%`, `%${keyOrQuery}%`, `%${keyOrQuery}%`);

    return {
      found: matches.length > 0,
      count: matches.length,
      results: matches.map(m => {
        let val = m.value;
        try { val = JSON.parse(m.value); } catch {}
        return {
          key: m.key,
          value: val,
          category: m.category,
          updatedAt: m.updated_at
        };
      })
    };
  }

  list(category = null) {
    let rows;
    if (category) {
      rows = this.db.prepare('SELECT key, category, agent_id, tags, updated_at FROM agent_memories WHERE category = ?').all(category);
    } else {
      rows = this.db.prepare('SELECT key, category, agent_id, tags, updated_at FROM agent_memories').all();
    }
    return rows;
  }

  delete(key) {
    this.db.prepare('DELETE FROM agent_memories WHERE key = ?').run(key);
    return { success: true, deletedKey: key };
  }
}

export const globalMemoryMesh = new MemoryMesh();
