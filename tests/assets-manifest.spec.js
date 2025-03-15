import { generateAssetsManifest } from '../src/assets-manifest.js';
import { readFile, mkdir } from 'fs/promises';
import { resolve } from 'path';

describe('SeaPlugin - generateAssetsManifest', () => {
  const outputPath = 'test_results';
  const inputAssets = {
    "assets/icon.jpg": { "src": "src/assets/icon.jpg" },
    "assets/icon2.jpg": { "src": "src/assets/icon2.jpg" }
  };
  
  beforeAll(async () => {
    await mkdir(outputPath, { recursive: true });
  });
  
  test('should generate the correct manifest file', async () => {
    const result = await generateAssetsManifest(outputPath, inputAssets);
    
    // Check that manifest.json was created with the expected content
    const manifestPath = resolve(outputPath, 'manifest.json');
    const manifestContent = JSON.parse(await readFile(manifestPath, 'utf-8'));
    
    expect(manifestContent).toMatchObject({
      ...inputAssets,
      "manifest.json": { "src": `${outputPath}/manifest.json` }
    });
  });

  test('should return a simplified manifest JSON', async () => {
    const result = await generateAssetsManifest(outputPath, inputAssets);
    
    expect(result).toEqual({
      "manifest.json": "dist/manifest.json",
      "assets/icon.jpg": "src/assets/icon.jpg",
      "assets/icon2.jpg": "src/assets/icon2.jpg"
    });
  });
});