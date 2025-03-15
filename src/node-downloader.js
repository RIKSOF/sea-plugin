import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';

import axios from 'axios';

import { extractForUnix } from './extract-unix.js';
import { extractForWin } from './extract-win.js';

/**
 * @param {string} downloadUrl
 * @param {string} downloadPath
 * @returns {Promise<void>}
 */
async function downloadFile(downloadUrl, downloadPath) {
  return new Promise((resolve, reject) => {
    axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream',
    })
      .then((response) => {
        const writer = createWriteStream(downloadPath);

        // Pipe the data to the file
        response.data.pipe(writer);

        // Wait until the download is finished
        writer.on('finish', () => {
          resolve(); // Resolve the promise once the download is done
        });

        writer.on('error', (err) => {
          console.error('Error writing the file:', err);
          reject(err); // Reject the promise if an error occurs
        });
      })
      .catch((err) => {
        console.error('Error downloading the file:', err);
        reject(err); // Reject the promise if the request fails
      });
  });
};

/**
 * @param {string} nodeVersion
 * @param {string} os
 * @param {string} cachePath
 */
async function downloadAndExtractNode(nodeVersion, os, cachePath) {
  const isWin = os.startsWith('win');
  const fileName = `node-v${nodeVersion}-${os}.${isWin ? 'zip' : 'tar.gz'}`;
  const downloadUrl = `https://nodejs.org/dist/v${nodeVersion}/${fileName}`;
  const nodeDir = join(cachePath, `node-v${nodeVersion}-${os}`);
  const downloadPath = join(cachePath, fileName);
  let nodeFilePath;

  console.log(`Downloading Node.js ${nodeVersion} for ${os}...`);
  await mkdir(cachePath, { recursive: true });
  await downloadFile(downloadUrl, downloadPath);

  if (isWin) {
    nodeFilePath = await extractForWin(nodeDir, downloadPath);
  } else {
    nodeFilePath = await extractForUnix(nodeDir, downloadPath);
  }

  await unlink(downloadPath);
  return nodeFilePath;
}

export { downloadAndExtractNode };
