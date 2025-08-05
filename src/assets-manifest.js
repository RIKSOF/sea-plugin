import { writeFile } from 'fs/promises';
import { isAbsolute, relative, resolve } from 'path';

/**
 * A single asset entry.
 * @typedef {{src: string, os?: string[], options?: any}} Asset
 *
 * A map of destination-path → asset-definition.
 * @typedef {{[destinationPath: string]: Asset}} AssetOption
 */

/**
 * Builds an assets manifest and returns a simplified map of
 * `destinationPath → src`, **filtered** to assets that match the target OS.
 * 
 * @param {string} outputPath - Absolute path where the manifest will be written.
 * @param {AssetOption} assetsJson - Full asset definition object.
 * @param {string} platform - Target platform string (e.g. `'win-x64'`).
 * @returns {Promise<Record<string, string>>} Simplified map used by the packager.
 */
async function generateAssetsManifest(outputPath, assetsJson, platform) {
  // 1️⃣  Filter for the requested platform.
  const platformAssets = Object.fromEntries(
    Object.entries(assetsJson).filter(
      ([, asset]) =>
        !asset.os ||                                // ◄ NEW: universal asset
        (Array.isArray(asset.os) && asset.os.includes(platform))
    ),
  );

  // 2️⃣  Deep-copy so we can mutate safely.
  const manifestCopy = JSON.parse(JSON.stringify(platformAssets));

  // 3️⃣  Add self-reference (relative path only).
  const MANIFEST = 'manifest.json';
  const MANIFEST_FILE = `manifest-${platform}.json`;
  const relativePath = relative(process.cwd(), 
    resolve(outputPath, MANIFEST_FILE)).replace(/\\/g, '/');  
  manifestCopy[MANIFEST] = { src: relativePath };

  // 4️⃣  Persist manifest.json next to the bundle.
  await writeFile(
    resolve(outputPath, MANIFEST_FILE),
    JSON.stringify(manifestCopy, null, 2)
  );

  /* 5️⃣  Return a simplified map where *every* src is absolute.
         – If the user already provided an absolute path, keep it.
         – Otherwise resolve it against `outputPath`.
  */
  const simplified = Object.fromEntries(
    Object.entries(manifestCopy).map(([dest, asset]) => [
      dest,
      isAbsolute(asset.src) ? asset.src : resolve(asset.src),
    ])
  );

  return simplified;
}

export { generateAssetsManifest };
