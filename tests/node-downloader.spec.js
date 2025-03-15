import { downloadAndExtractNode } from '../src/node-downloader.js';
import fs from 'fs/promises';
import path from 'path';

const nodeVersion = '23.9.0'; // Change as needed
const cachePath = path.resolve('./test_results');
const operatingSystems = ['win-x64', 'darwin-arm64', 'linux-x64'];

describe('SeaPlugin - downloadAndExtractNode', () => {
  test.each(operatingSystems)('should download and extract Node.js binary for %s', async (os) => {
    const nodePath = await downloadAndExtractNode(nodeVersion, os, cachePath);
    await expect(fs.access(nodePath)).resolves.not.toThrow();
  });
});
