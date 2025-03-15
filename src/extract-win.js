import { join, dirname } from 'path';
import { Open } from 'unzipper';

/**
 * @param {string} nodeDir
 * @param {string} downloadPath
 */
async function extractForWin(nodeDir, downloadPath) {
  const directory = await Open.file(downloadPath);
  await directory.extract({ path: dirname(nodeDir) });
  
  return join(nodeDir, 'node.exe');
}

export { extractForWin };
