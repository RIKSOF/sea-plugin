export default SeaPlugin;
export type AssetOption = {
  [key: string]: {
    src: string;
    options: any;
  };
};
export type Compiler = import('webpack').Compiler;
/** @typedef {{[key: string]: {src: string, options: any}}} AssetOption */
/** @typedef {import('webpack').Compiler} Compiler */
declare class SeaPlugin {
  /**
   * @param {{name?: string, nodeVersion: string, os: string | string[], cachePath?: string,
   * assets?: AssetOption}} options
   */
  constructor(options?: {
    name?: string;
    nodeVersion: string;
    os: string | string[];
    cachePath?: string;
    assets?: AssetOption;
  });
  name: string | undefined;
  nodeVersion: string;
  os: string[];
  cachePath: string | undefined;
  assets: AssetOption;
  /**
   * @param {Compiler} compiler
   */
  apply(compiler: Compiler): Promise<void>;
}
