import { writeFile } from 'fs/promises';
import { resolve } from 'path';

/** @typedef {{[key: string]: {src: string, options: any}}} AssetOption */

/**
 * @param {string} outputPath
 * @param {AssetOption} assetsJson
 */
async function generateAssetsManifest(outputPath, assetsJson) {
  // Step 1: Make a copy of the JSON
  const manifestCopy = JSON.parse(JSON.stringify(assetsJson));

  // Step 2: Add the manifest.json key
  manifestCopy['manifest.json'] = { src: `${outputPath}/manifest.json` };

  // Step 3: Save the modified JSON to outputPath
  const manifestPath = resolve(outputPath, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifestCopy, null, 2));

  // Step 4: Generate a new JSON with only src values
  const simplifiedManifest = Object.fromEntries(
    Object.entries(manifestCopy).map(([key, value]) => [key, value.src])
  );

  return simplifiedManifest;
}

export { generateAssetsManifest };
