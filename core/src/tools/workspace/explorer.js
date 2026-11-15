import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.turbo', '.cache']);

/**
 * OmniMCP Workspace Intelligence & Codebase Toolpack
 */
export class WorkspaceExplorer {
  getTree(dirPath = process.cwd(), maxDepth = 3) {
    function walk(dir, currentDepth) {
      if (currentDepth > maxDepth) return [];
      const entries = [];
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          if (IGNORED_DIRS.has(item.name)) continue;
          const fullPath = path.join(dir, item.name);
          const relPath = path.relative(dirPath, fullPath);

          if (item.isDirectory()) {
            entries.push({
              name: item.name,
              type: 'directory',
              path: relPath,
              children: walk(fullPath, currentDepth + 1)
            });
          } else {
            entries.push({
              name: item.name,
              type: 'file',
              path: relPath,
              size: fs.statSync(fullPath).size
            });
          }
        }
      } catch {}
      return entries;
    }

    return walk(dirPath, 1);
  }

  search(query, dirPath = process.cwd(), filePattern = '') {
    const results = [];
    const regex = new RegExp(query, 'i');

    function searchDir(dir) {
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          if (IGNORED_DIRS.has(item.name)) continue;
          const fullPath = path.join(dir, item.name);

          if (item.isDirectory()) {
            searchDir(fullPath);
          } else if (item.isFile()) {
            if (filePattern && !item.name.includes(filePattern)) continue;
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const lines = content.split(/\r?\n/);
              for (let i = 0; i < lines.length; i++) {
                if (regex.test(lines[i])) {
                  results.push({
                    file: path.relative(dirPath, fullPath),
                    line: i + 1,
                    snippet: lines[i].trim().slice(0, 150)
                  });
                  if (results.length >= 50) return;
                }
              }
            } catch {}
          }
        }
      } catch {}
    }

    searchDir(dirPath);
    return results;
  }

  calculateTokenBudget(textOrFiles, modelLimit = 128000) {
    let charCount = 0;
    if (typeof textOrFiles === 'string') {
      charCount = textOrFiles.length;
    } else if (Array.isArray(textOrFiles)) {
      for (const f of textOrFiles) {
        try {
          if (fs.existsSync(f)) {
            charCount += fs.readFileSync(f, 'utf-8').length;
          }
        } catch {}
      }
    }

    const estimatedTokens = Math.ceil(charCount / 4);
    const percentOfBudget = Number(((estimatedTokens / modelLimit) * 100).toFixed(2));

    return {
      characterCount: charCount,
      estimatedTokens,
      modelContextLimit: modelLimit,
      remainingTokens: Math.max(0, modelLimit - estimatedTokens),
      percentUsed: percentOfBudget,
      isWithinBudget: estimatedTokens < modelLimit
    };
  }

  getGitStatus(dirPath = process.cwd()) {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: dirPath, encoding: 'utf-8' }).trim();
      const statusOutput = execSync('git status --short', { cwd: dirPath, encoding: 'utf-8' });
      const changedFiles = statusOutput.trim().split('\n').filter(Boolean).map(l => l.trim());

      return {
        isGitRepo: true,
        branch,
        changedFilesCount: changedFiles.length,
        changedFiles: changedFiles.slice(0, 15)
      };
    } catch {
      return { isGitRepo: false, branch: 'none', changedFilesCount: 0 };
    }
  }
}

export const globalWorkspaceExplorer = new WorkspaceExplorer();
