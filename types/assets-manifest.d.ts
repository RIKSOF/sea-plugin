/**
 * A map of destination-path → asset-definition.
 */
export type Asset = {
  src: string;
  os?: string[];
  options?: any;
};
/**
 * A single asset entry.
 */
export type AssetOption = {
  [destinationPath: string]: Asset;
};
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
export function generateAssetsManifest(
  outputPath: string,
  assetsJson: AssetOption,
  platform: string,
): Promise<Record<string, string>>;
