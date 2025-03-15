/**
 * @param {string} nodeVersion
 * @param {string} os
 * @param {string} cachePath
 */
export function checkNodeInCache(
  nodeVersion: string,
  os: string,
  cachePath: string,
): Promise<string | null>;
