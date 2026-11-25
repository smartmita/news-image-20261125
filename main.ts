// Node 22 standard-library entrypoint for the Wed 25 Nov 2026 world news image.
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

const PNG_HEADER = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const MAX_BYTES = 1048576;
const MAX_DIM = 1024;

function assertValidPng(buffer: Buffer): { width: number; height: number } {
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    throw new Error(`Unexpected PNG byte length: ${buffer.length}`);
  }
  if (!buffer.subarray(0, 8).equals(PNG_HEADER)) {
    throw new Error('Image header does not match PNG magic bytes');
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width < 1 || height < 1 || width > MAX_DIM || height > MAX_DIM) {
    throw new Error(`PNG dimensions out of bounds: ${width}x${height}`);
  }
  return { width, height };
}

function publishEntryImage(): void {
  const destinationDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
  fs.mkdirSync(destinationDir, { recursive: true });
  const here = path.dirname(url.fileURLToPath(import.meta.url));
  const sourceAsset = path.join(here, 'entry.png');
  const payload = fs.readFileSync(sourceAsset);
  const dims = assertValidPng(payload);
  const targetAsset = path.join(destinationDir, 'entry.png');
  fs.writeFileSync(targetAsset, payload);
  process.stdout.write(`Published ${targetAsset} (${dims.width}x${dims.height}, ${payload.length} B)\n`);
}

publishEntryImage();
