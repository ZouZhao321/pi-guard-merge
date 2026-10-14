import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = resolve(root, "package.json");

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

assert.equal(pkg.license, "MIT", "package.json license must be MIT");

const extensions = pkg.pi?.extensions;
assert.ok(
	Array.isArray(extensions) && extensions.length > 0,
	"package.json pi.extensions must be a non-empty array",
);

for (const entry of extensions) {
	assert.ok(existsSync(resolve(root, entry)), `pi.extensions entry does not exist: ${entry}`);
}

console.log(`smoke ok: license=${pkg.license}, extensions=${extensions.join(", ")}`);
