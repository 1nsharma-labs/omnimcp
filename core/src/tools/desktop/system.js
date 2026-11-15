import os from 'node:os';
import { execSync } from 'node:child_process';

/**
 * OmniMCP Cross-Platform Desktop OS Toolpack
 */
export class DesktopSystem {
  getSystemInfo() {
    const totalMemGB = Number((os.totalmem() / (1024 * 1024 * 1024)).toFixed(2));
    const freeMemGB = Number((os.freemem() / (1024 * 1024 * 1024)).toFixed(2));
    const usedMemGB = Number((totalMemGB - freeMemGB).toFixed(2));
    const memUsagePct = Math.round((usedMemGB / totalMemGB) * 100);

    return {
      platform: os.platform(),
      osType: os.type(),
      osRelease: os.release(),
      architecture: os.arch(),
      hostname: os.hostname(),
      cpuCores: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Generic CPU',
      memory: {
        totalGB: totalMemGB,
        usedGB: usedMemGB,
        freeGB: freeMemGB,
        usagePercentage: memUsagePct
      },
      uptimeHours: Number((os.uptime() / 3600).toFixed(1))
    };
  }

  notify(title, message) {
    const platform = os.platform();
    try {
      if (platform === 'win32') {
        // PowerShell Toast / Popup notification
        execSync(`powershell -Command "[reflection.assembly]::loadwithpartialname('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('${message.replace(/'/g, "''")}', '${title.replace(/'/g, "''")}')"`, { stdio: 'ignore', timeout: 5000 });
      } else if (platform === 'darwin') {
        execSync(`osascript -e 'display notification "${message}" with title "${title}"'`, { stdio: 'ignore' });
      } else {
        execSync(`notify-send "${title}" "${message}"`, { stdio: 'ignore' });
      }
      return { success: true, delivered: true, platform };
    } catch {
      // Graceful fallback to console bell/log
      console.log(`\n🔔 [DESKTOP NOTIFICATION] ${title}: ${message}\n`);
      return { success: true, delivered: 'fallback_stdout', platform };
    }
  }

  execSafe(commandLine) {
    try {
      const output = execSync(commandLine, {
        encoding: 'utf-8',
        timeout: 10000,
        maxBuffer: 1024 * 1024
      });
      return { success: true, exitCode: 0, output: output.trim() };
    } catch (err) {
      return { success: false, exitCode: err.status || 1, error: err.message, output: err.stdout?.toString() || '' };
    }
  }
}

export const globalDesktopSystem = new DesktopSystem();
