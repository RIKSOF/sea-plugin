import { writeFile, copyFile, chmod, readFile } from 'fs/promises';
import { join, parse, resolve } from 'path';
import { exec } from 'child_process';
import { inject } from 'postject';
import { promisify } from 'util';
import { checkNodeInCache } from './node-cache.js';
import { downloadAndExtractNode } from './node-downloader.js';
import { generateAssetsManifest } from './assets-manifest.js';

const execPromise = promisify(exec);

/** @typedef {{[key: string]: {src: string, options: any}}} AssetOption */
/** @typedef {import('webpack').Compiler} Compiler */

class SeaPlugin {
  /**
   * @param {{name?: string, nodeVersion: string, os: string | string[], cachePath?: string, 
   * assets?: AssetOption}} options 
   */
  constructor(options = {nodeVersion: '23.9.0', os: []}) {
    this.name = options.name;
    this.nodeVersion = options.nodeVersion;
    this.os = Array.isArray(options.os) ? options.os : [options.os];
    this.cachePath = options.cachePath;
    this.assets = options.assets || {};
  }

  /**
   * @param {Compiler} compiler 
   */
  async apply(compiler) {
    compiler.hooks.afterEmit.tapPromise('SeaPlugin', async (compilation) => {
      try {
        const outputOptions = compiler.options.output;
        const outputPath = outputOptions.path || '';
        this.cachePath = this.cachePath || join(outputPath, '.node_cache');

        const mainOutputFile = outputOptions.filename || '';
        // @ts-ignore
        const configName = this.name || parse(mainOutputFile).name;
        const configFilePath = resolve(outputPath, 'sea-config.json');
        const blobFilePath = resolve(outputPath, `${configName}.blob`);

        // Generate assets manifest
        const assetsManifest = await generateAssetsManifest(outputPath, this.assets);

        await writeFile(configFilePath, JSON.stringify({
          main: mainOutputFile,
          output: `${configName}.blob`,
          disableExperimentalSEAWarning: true,
          assets: assetsManifest
        }, null, 2));

        for (const os of this.os) {
          const isWin = os.startsWith('win');
          const isMac = os.startsWith('darwin');
          const exeFilePath = resolve(outputPath, `${configName}-${os}${isWin ? '.exe' : ''}`);

          // Check if Node.js is cached, otherwise download it
          let nodePath = await checkNodeInCache(this.nodeVersion, os, this.cachePath);
          if (!nodePath) {
            nodePath = await downloadAndExtractNode(this.nodeVersion, os, this.cachePath);
          }

          // Copy nodePath to exeFilePath
          await copyFile(nodePath, exeFilePath);
          await chmod(exeFilePath, 0o755);

          await execPromise(`node --experimental-sea-config sea-config.json`, { cwd: outputPath });
          
          const blobBuffer = await readFile(blobFilePath);
          
          await inject(exeFilePath, 'NODE_SEA_BLOB', blobBuffer, {
            sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
            overwrite: true,
            ...(isMac && { machoSegmentName: 'NODE_SEA' })
          });
        }
      } catch (error) {
        // @ts-ignore
        compilation.errors.push(new Error(`SeaPlugin error: ${error.message}`));
      }
    });
  }
}

module.exports = SeaPlugin;
