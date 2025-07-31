import { writeFile, copyFile, chmod, readFile } from 'fs/promises';
import { parse, resolve, join } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { inject } from 'postject';
import { checkNodeInCache } from './node-cache.js';
import { downloadAndExtractNode } from './node-downloader.js';
import { generateAssetsManifest } from './assets-manifest.js';

const execPromise = promisify(exec);

/**
 * Types
 * ---------------------------------------------------------------------------
 * @typedef {import('./assets-manifest.js').AssetOption} AssetOption
 * @typedef SeaEsbuildPluginOptions
 * @property {string} [name]                  Name prefix for output executables.
 * @property {string}  nodeVersion            Node.js version to embed.
 * @property {string|string[]} os             Target operating system(s).
 * @property {string} [cachePath]             Custom cache directory.
 * @property {AssetOption} [assets]           Asset manifest object.
 */

/**
 * esbuild plugin factory that packages a Node application into cross‑platform SEA executables.
 * @param {SeaEsbuildPluginOptions} options Plugin options
 * @returns {import('esbuild').Plugin}
 */
export function SeaEsbuildPlugin(options = {nodeVersion: '23.9.0', os: []}) {
  const {
    name,
    nodeVersion,
    os,
    cachePath,
    assets = {},
  } = options;
  const platforms = Array.isArray(os) ? os : [os];

  return {
    name: 'sea-plugin-esbuild',
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length) return; // abort on build errors

        try {
          const outdir = build.initialOptions.outdir ?? (build.initialOptions.outfile ? parse(build.initialOptions.outfile).dir : process.cwd());
          const outfileName = build.initialOptions.outfile ? parse(build.initialOptions.outfile).base : 'bundle.js';
          const outputPath = resolve(outdir);
          const cacheDir = cachePath || join(outputPath, '.node_cache');

          const configName = name || parse(outfileName).name;
          const blobFilePath = resolve(outputPath, `${configName}.blob`);

          for (const platform of platforms) {
            const configFilePath = resolve(outputPath, `sea-config-${platform}.json`);

            // assets manifest
            const assetsManifest = await generateAssetsManifest(outputPath, assets, platform);

            await writeFile(
              configFilePath,
              JSON.stringify(
                {
                  main: outfileName,
                  output: `${configName}.blob`,
                  disableExperimentalSEAWarning: true,
                  assets: assetsManifest,
                },
                null,
                2,
              ),
            );

            const isWin = platform.startsWith('win');
            const isMac = platform.startsWith('darwin');
            const exeFilePath = resolve(outputPath, `${configName}-${platform}${isWin ? '.exe' : ''}`);

            let nodePath = await checkNodeInCache(nodeVersion, platform, cacheDir);
            if (!nodePath) nodePath = await downloadAndExtractNode(nodeVersion, platform, cacheDir);

            await copyFile(nodePath, exeFilePath);
            await chmod(exeFilePath, 0o755);

            await execPromise(`node --experimental-sea-config sea-config-${platform}.json`, { cwd: outputPath });
            const blobBuffer = await readFile(blobFilePath);

            await inject(exeFilePath, 'NODE_SEA_BLOB', blobBuffer, {
              sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
              overwrite: true,
              ...(isMac && { machoSegmentName: 'NODE_SEA' }),
            });
          }
        } catch (e) {
          /** @type {import('esbuild').Message} */
          const msg = /** @type {any} */ ({
            text: `SeaEsbuildPlugin error: ${e.message}`,
            pluginName: 'sea-plugin-esbuild',
          });

          // esbuild Message requires id/location; not necessary here
          result.errors.push(msg);
        }
      });
    },
  };
}
