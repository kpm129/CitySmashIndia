import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import assert from "node:assert/strict";
const root = process.cwd(),
  manifest = JSON.parse(
    readFileSync("public/assets/asset-manifest.json", "utf8"),
  );
assert.equal(manifest.version, 1);
const ids = new Set();
for (const asset of [...manifest.assets, ...manifest.originals]) {
  assert(!ids.has(asset.id), "Duplicate asset ID");
  ids.add(asset.id);
  assert(asset.creator && asset.localPath, "Missing attribution");
  const path = resolve(asset.localPath);
  assert(!relative(root, path).startsWith(".."), "Escaping asset path");
  assert(existsSync(path), "Missing asset file");
  if (manifest.assets.includes(asset)) {
    for (const k of [
      "title",
      "sourcePage",
      "originalFile",
      "license",
      "licenseUrl",
      "attribution",
      "changes",
      "retrieved",
      "sha256",
    ])
      assert(asset[k], `Missing ${k}`);
    assert(/^https:\/\//.test(asset.licenseUrl));
    assert(!/NonCommercial|NoDerivatives|unknown/i.test(asset.license));
    const { createHash } = await import("node:crypto");
    assert.equal(
      createHash("sha256").update(readFileSync(path)).digest("hex"),
      asset.sha256,
    );
  }
}
for (const f of readdirSync("public/assets"))
  assert(
    f === "asset-manifest.json" ||
      manifest.assets.some((a) => a.localPath === "public/assets/" + f),
    "Unrecorded media",
  );
assert(readFileSync("THIRD_PARTY_NOTICES.md", "utf8").includes("Phaser"));
console.log(
  `Validated ${manifest.assets.length} third-party media and ${manifest.originals.length} original procedural asset sources.`,
);
