import { access } from 'fs/promises';
import { join } from 'path';

/**
 * @param {string} nodeVersion
 * @param {string} os
 * @param {string} cachePath
 */
async function checkNodeInCache(nodeVersion, os, cachePath) {
  const isWin = os.startsWith('win');
  const nodeDir = join(cachePath, `node-v${nodeVersion}-${os}`);
  const nodeFilePath = join(nodeDir, isWin ? 'node.exe' : 'bin/node');
  
  try {
    await access(nodeFilePath);
    return nodeFilePath;
  } catch {
    return null;
  }
}

export { checkNodeInCache };
