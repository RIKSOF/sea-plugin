declare module 'postject' {
  export function inject(
    filePath: string,
    key: string,
    data: Buffer,
    options?: { sentinelFuse?: string; overwrite?: boolean; machoSegmentName?: string }
  ): Promise<void>;
}