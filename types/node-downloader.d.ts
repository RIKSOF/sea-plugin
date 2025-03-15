/**
 * @param {string} nodeVersion
 * @param {string} os
 * @param {string} cachePath
 */
export function downloadAndExtractNode(
  nodeVersion: string,
  os: string,
  cachePath: string,
): Promise<string>;
