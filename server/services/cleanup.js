import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export async function cleanupOldFiles() {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const now = Date.now();
    let deleted = 0;

    for (const file of files) {
      if (file === '.gitkeep') continue;
      const filePath = path.join(UPLOADS_DIR, file);
      try {
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs > MAX_AGE_MS) {
          await fs.unlink(filePath);
          deleted++;
        }
      } catch {}
    }

    if (deleted > 0) console.log(`[cleanup] Removed ${deleted} old file(s)`);
  } catch (err) {
    console.error('[cleanup] Error:', err.message);
  }
}

export function startCleanupCron(intervalMs = 60 * 60 * 1000) {
  cleanupOldFiles();
  setInterval(cleanupOldFiles, intervalMs);
  console.log(`[cleanup] Cron started (every ${intervalMs / 60000} min)`);
}
