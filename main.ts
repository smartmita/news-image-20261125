// Deterministic Node 22 entrypoint for Wednesday 25 November 2026 world news broadsheet.
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });

const dst = join(outDir, 'entry.png');
copyFileSync(new URL('./entry.png', import.meta.url), dst);

const st = statSync(dst);
if (st.size === 0 || st.size > 1048576) {
  throw new Error(`Invalid entry.png size: ${st.size}`);
}
const buf = readFileSync(dst);
if (!buf.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('Output file is not a valid PNG');
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width > 1024 || height > 1024 || width === 0 || height === 0) {
  throw new Error(`Invalid PNG dimensions: ${width}x${height}`);
}
console.log(`Wrote ${dst} (${width}x${height}, ${st.size} bytes)`);
