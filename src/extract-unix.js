import { mkdir, unlink } from 'fs/promises';
import { join } from 'path';

import * as tar from 'tar';

/**
 * @param {string} nodeDir
 * @param {string} downloadPath
 */
async function extractForUnix(nodeDir, downloadPath) {
  await mkdir(nodeDir, { recursive: true });
  await tar.x({ file: downloadPath, cwd: nodeDir, strip: 1 });
  
  return join(nodeDir, 'bin/node');
}

export { extractForUnix };
