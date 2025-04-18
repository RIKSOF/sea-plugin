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
export function SeaEsbuildPlugin(
  options?: SeaEsbuildPluginOptions,
): import('esbuild').Plugin;
/**
 * Types
 * ---------------------------------------------------------------------------
 */
export type AssetOption = import('./assets-manifest.js').AssetOption;
/**
 * Types
 * ---------------------------------------------------------------------------
 */
export type SeaEsbuildPluginOptions = {
  /**
   * Name prefix for output executables.
   */
  name?: string | undefined;
  /**
   * Node.js version to embed.
   */
  nodeVersion: string;
  /**
   * Target operating system(s).
   */
  os: string | string[];
  /**
   * Custom cache directory.
   */
  cachePath?: string | undefined;
  /**
   * Asset manifest object.
   */
  assets?: import('./assets-manifest.js').AssetOption | undefined;
};
