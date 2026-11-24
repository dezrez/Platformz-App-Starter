import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, regular, walk, validate } from './validate.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const table = Uint32Array.from({ length: 256 }, (_, n) => { for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ n >>> 1 : n >>> 1; return n >>> 0; });
const crc32 = b => { let n = 0xffffffff; for (const byte of b) n = table[(n ^ byte) & 255] ^ n >>> 8; return (n ^ 0xffffffff) >>> 0; };
/** Deterministic ZIP STORE with fixed dates, order and regular-file permissions. */
export function zipFiles(files, prefix = '') {
  assert.ok(!prefix || /^[\w-]+\/$/.test(prefix)); const local = [], index = []; let offset = 0;
  for (const [name, value] of [...files].sort(([a], [b]) => a.localeCompare(b, 'en'))) {
    assert.match(name, /^[\w./-]+$/); assert.ok(!name.startsWith('/') && !name.split('/').some(p => !p || p === '..' || p === '.'));
    const data = Buffer.from(value), file = Buffer.from(prefix + name), crc = crc32(data), header = Buffer.alloc(30), central = Buffer.alloc(46);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6); header.writeUInt16LE(33, 12); header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(file.length, 26);
    central.writeUInt32LE(0x02014b50); central.writeUInt16LE(0x314, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8); central.writeUInt16LE(33, 14); central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(file.length, 28); central.writeUInt32LE((0o100644 << 16) >>> 0, 38); central.writeUInt32LE(offset, 42);
    local.push(header, file, data); index.push(central, file); offset += header.length + file.length + data.length;
  }
  assert.ok(files.size <= 65535); const directory = Buffer.concat(index), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.size, 8); end.writeUInt16LE(files.size, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16); return Buffer.concat([...local, directory, end]);
}
export async function collectSource() {
  await validate(); const files = new Map();
  for (const name of ['package.json', 'package-lock.json', '.npmrc', '.gitignore', '.gitattributes', 'angular.json', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json', 'manifest.json', 'README.md', 'DEZREZ-START-HERE.md', 'AGENTS.md', 'CLAUDE.md', 'LICENSE', 'COMPATIBILITY.md', 'RESOURCE-PROVENANCE.json', ...await walk('src'), ...await walk('public'), ...await walk('scripts'), ...await walk('skills'), ...await walk('references')]) files.set(name, await regular(name));
  try { files.set('dezrez-certification.json', await regular('dezrez-certification.json', 2_000_000)); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  return files;
}
/** Public browser bytes only; retain the profile's supported app-image area. */
export function packageableBrowserFile(relative) {
  if (/^(?:mock-host\.|fixtures\/|sdk\/|lib\/)/.test(relative) || relative === 'dezrez-certification.json') return false;
  if (!/\.(?:html|js|css|json|svg|png|jpe?g|webp|ico|woff2?|ttf|txt)$/i.test(relative)) return false;
  if (relative.startsWith('assets/')) return relative === 'assets/favicon.svg' || /^assets\/app\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:svg|png|jpe?g|webp|ico)$/i.test(relative);
  return true;
}
export async function packageApp() {
  await validate(); const prefix = 'dist/angular-basic/browser/', files = new Map();
  for (const name of await walk('dist/angular-basic/browser')) {
    assert.ok(!name.endsWith('.map'), 'Production packages must not include source maps.');
    const relative = name.slice(prefix.length);
    if (!packageableBrowserFile(relative)) continue;
    files.set(relative, await regular(name));
  }
  const index = files.get('index.html')?.toString(); assert.ok(index && !/<style\b/i.test(index) && !/<script\b(?![^>]*\bsrc=)[^>]*>/i.test(index), 'The built page must use external scripts and styles.');
  files.set('manifest.json', await regular('manifest.json'));
  files.set('THIRD-PARTY-LICENSES.txt', await regular('dist/angular-basic/3rdpartylicenses.txt'));
  for (const name of ['Exo2-OFL.txt', 'Poppins-OFL.txt']) files.set('LICENSES/' + name, await regular('public/assets/fonts/' + name));
  files.set('LICENSES/MIT.txt', await regular('LICENSE'));
  const bytes = zipFiles(files); await mkdir(path.join(root, 'artifacts'), { recursive: true });
  await writeFile(path.join(root, 'artifacts/app.zip'), bytes);
  const result = { format: 'dezrez.angular-basic-package/1', sha256: hash(bytes), bytes: bytes.length, files: [...files].map(([name, data]) => ({ name, sha256: hash(data), bytes: data.length })), certification: 'not-performed' };
  await writeFile(path.join(root, 'artifacts/app.receipt.json'), JSON.stringify(result, null, 2) + '\n'); console.log(JSON.stringify({ sha256: result.sha256, bytes: result.bytes, files: files.size, certification: result.certification })); return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await packageApp();
