import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, lstat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTOCOL, OPERATIONS } from '../public/sdk/protocol.js';
import { requireCompleteManifestDeclarations } from '../public/sdk/manifest.js';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const digestPattern = /^sha512-[A-Za-z0-9+/]+=*$/;
export async function regular(relative, maximum = 4_000_000) {
  assert.ok(relative && !path.isAbsolute(relative) && !relative.split('/').some(part => !part || part === '..' || part === '.'));
  let target = root;
  for (const part of relative.split('/')) { target = path.join(target, part); assert.equal((await lstat(target)).isSymbolicLink(), false); }
  const stat = await lstat(target); assert.ok(stat.isFile() && stat.size > 0 && stat.size <= maximum);
  return readFile(target);
}
export async function walk(relative) {
  const stat = await lstat(path.join(root, relative)); assert.equal(stat.isSymbolicLink(), false);
  if (stat.isFile()) return [relative];
  assert.ok(stat.isDirectory());
  const files = [];
  for (const entry of (await readdir(path.join(root, relative))).sort()) {
    assert.ok(!entry.startsWith('.') && !['node_modules', 'dist', 'artifacts'].includes(entry), 'Private or generated content cannot enter exported source.');
    files.push(...await walk(relative + '/' + entry));
  }
  return files;
}
export async function validate() {
  const pkg = JSON.parse(await regular('package.json')), lock = JSON.parse(await regular('package-lock.json'));
  assert.equal(lock.lockfileVersion, 3); assert.equal(lock.name, pkg.name); assert.equal(lock.version, pkg.version);
  assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies); assert.deepEqual(lock.packages[''].devDependencies, pkg.devDependencies);
  const provenance = JSON.parse(await regular('RESOURCE-PROVENANCE.json'));
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(hash(await regular('package-lock.json')), provenance.dependencyLockSha256, 'The dependency profile needs a reviewed update.');
  for (const [name, digest] of Object.entries(provenance.copiedResourceSha256)) assert.equal(hash(await regular('public/' + name)), digest, 'The supplied SDK or theme runtime changed.');
  for (const group of [pkg.dependencies, pkg.devDependencies]) for (const version of Object.values(group)) assert.match(version, /^\d+\.\d+\.\d+$/);
  for (const [name, item] of Object.entries(lock.packages)) if (name) {
    assert.match(item.version, /^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/);
    assert.ok(item.resolved?.startsWith('https://registry.npmjs.org/'), 'Dependencies must resolve from the public registry.');
    assert.match(item.integrity, digestPattern);
    assert.equal(item.link, undefined);
  }
  const manifest = JSON.parse(await regular('manifest.json'));
  assert.match(manifest.id, /^[a-zA-Z0-9_.-]{1,100}$/); assert.ok(manifest.name); assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.protocol, PROTOCOL); assert.equal(manifest.host, 'rezi');
  const welcome = manifest.starter?.phase === 'welcome';
  if (welcome) {
    // This draft check is intentionally separate from record certification.
    assert.deepEqual(Object.keys(manifest).sort(), ['id', 'name', 'version', 'protocol', 'host', 'surface', 'permissions', 'providerDestinations', 'starter'].sort());
    assert.equal(manifest.surface, 'dashboard-widget'); assert.deepEqual(manifest.permissions, []);
    assert.deepEqual(manifest.starter, { phase: 'welcome', context: 'not-chosen' });
  } else {
    requireCompleteManifestDeclarations(manifest);
    assert.equal(manifest.surface, 'record-action');
    assert.deepEqual([...manifest.permissions].sort(), [...OPERATIONS].sort());
  }
  assert.deepEqual(manifest.providerDestinations, []);
  const recordExample = JSON.parse(await regular('public/examples/record-notes.manifest.json'));
  requireCompleteManifestDeclarations(recordExample);
  assert.equal(recordExample.surface, 'record-action'); assert.deepEqual([...recordExample.permissions].sort(), [...OPERATIONS].sort());
  assert.deepEqual(JSON.parse(await regular('public/manifest.json')), manifest, 'Keep the mock manifest in sync with manifest.json.');
  const angular = JSON.parse(await regular('angular.json'));
  assert.equal(angular.projects['angular-basic'].architect.build.builder, '@angular/build:application');
  assert.equal(angular.projects['angular-basic'].architect.build.configurations.production.optimization.styles.inlineCritical, false);
  assert.equal(angular.projects['angular-basic'].architect.build.configurations.production.optimization.fonts, false);
  const forbidden = /(?:https?:\/\/dev\.azure\.com\/|[A-Z]:[\\/]Users[\\/]|source[\\/]repos[\\/]|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bBearer\s+[A-Za-z0-9._-]{20,})/i;
  for (const name of [...await walk('src'), ...await walk('public'), ...await walk('scripts'), ...await walk('skills'), ...await walk('references')]) {
    if (!/\.(?:[cm]?js|ts|json|html|css|md|txt|svg)$/.test(name)) continue;
    const text = (await regular(name)).toString('utf8'); assert.equal(forbidden.test(text), false, 'Private material in ' + name);
  }
  assert.equal((await regular('src/app/app.component.ts')).toString().includes('styleUrls'), false, 'Component CSS must stay in the compiled global stylesheet.');
  return { manifestId: manifest.id, protocol: manifest.protocol, phase: welcome ? 'welcome' : 'record-example', certification: 'not-performed', packages: Object.keys(lock.packages).length - 1, dependencyLockChecked: true };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await validate())); }
  catch { console.error('Starter validation failed. Ask your coding assistant to inspect the manifest, locked dependencies and public files.'); process.exitCode = 1; }
}
