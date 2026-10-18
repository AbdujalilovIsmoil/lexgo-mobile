// Runs the pure-TypeScript checks of the INFRA package under plain node, with the project's own
// compiler and no extra tooling: deep-link resolver (66), PII scrubber + buckets (15), notification
// normalize / classify / fold (23). Usage: node scripts/check-infra.mjs
import { createRequire } from "node:module";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = new URL("../src/", import.meta.url).pathname;
const out = mkdtempSync(join(tmpdir(), "infra-check-"));

const dirOf = (d) => readdirSync(join(root, d), { withFileTypes: true }).flatMap((f) => (f.isDirectory() ? dirOf(`${d}/${f.name}`) : f.name.endsWith(".ts") ? [`${d}/${f.name}`] : []));
const FILES = [
  ...dirOf("shared/links"),
  "shared/analytics/scrub.ts", "shared/analytics/buckets.ts", "shared/analytics/breadcrumbs.ts", "shared/analytics/checks/scrub.check.ts",
  "shared/lib/json.ts", "shared/config/infra.ts",
  "entities/notification/api/normalize.ts", "entities/notification/model/types.ts", "entities/notification/model/classify.ts",
  "entities/notification/model/fold.ts", "entities/notification/model/checks/notif.check.ts",
];

for (const rel of FILES) {
  const js = ts.transpileModule(readFileSync(join(root, rel), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const dest = join(out, rel.replace(/\.ts$/, ".js"));
  // `@/x/y` → a relative require inside the temp tree
  const fixed = js.replace(/require\("@\/([^"]+)"\)/g, (_m, p) => `require(${JSON.stringify("./" + relative(dirname(dest), join(out, p)).replace(/^\.\//, ""))})`);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, fixed);
}

const runs = [
  require(join(out, "shared/links/checks/run.js")).runChecks(),
  require(join(out, "shared/analytics/checks/scrub.check.js")).runScrubChecks(),
  require(join(out, "entities/notification/model/checks/notif.check.js")).runNotifChecks(),
];
const total = runs.reduce((n, r) => n + r.total, 0);
const failures = runs.flatMap((r) => r.failures);
console.log(`${total - failures.length}/${total} INFRA checks passed`);
for (const f of failures) console.log("FAIL", f);
process.exit(failures.length ? 1 : 0);
