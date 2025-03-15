export type AssetOption = {
  [key: string]: {
    src: string;
    options: any;
  };
};
/** @typedef {{[key: string]: {src: string, options: any}}} AssetOption */
/**
 * @param {string} outputPath
 * @param {AssetOption} assetsJson
 */
export function generateAssetsManifest(
  outputPath: string,
  assetsJson: AssetOption,
): Promise<{
  [k: string]: any;
}>;
