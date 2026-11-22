// Role: static integrity checks of verification.md section B by pattern search, instead of model reading.
// Inputs: <root> (root of the generated local web app)
// Outputs: stdout = one "[point] file:line: message" line per finding, then a total; "OK" if none.
//   Points: 4 TODO · 6/13 inline style · 7 server bound to 0.0.0.0 · 8 alert/confirm · logging console.* ·
//   env-config process.env outside config.ts, .env.example · 9 fetch outside src/services and http-client.ts ·
//   theme data-theme without the bs- prefix · 16 versions · 17 .gitignore.
// Exit codes: 0 no finding, 1 at least one finding, 4 invalid argument.
// Documented exceptions stay to be judged by the model.
// Command replaced: /local-webapp-p5-development, /local-webapp-add-feature, /local-webapp-fix-issue, section B.
// Example: node .claude/scripts/static-checks.mjs C:\projects\MyApp

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2];
if (!root || !existsSync(root)) {
  console.error("Usage: static-checks.mjs <root>");
  process.exit(4);
}

const findings = [];
const add = (point, file, line, msg) => findings.push(`[${point}] ${file}${line ? ":" + line : ""}: ${msg}`);
const rel = (f) => relative(root, f).split("\\").join("/");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (["node_modules", "dist", ".git"].includes(e)) continue;
    const p = join(dir, e);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const files = walk(join(root, "src")).filter((f) => /\.(ts|tsx|js|scss|css|html|ejs|hbs|njk|pug)$/.test(f));
const isCode = (f) => /\.(ts|tsx|js)$/.test(f);
const rules = [
  { point: "4", re: /\/\/\s*TODO/, msg: "// TODO is forbidden", only: isCode },
  { point: "6", re: /\bstyle\s*=\s*["{]/, msg: "inline style attribute is forbidden", only: (f) => !/\.(scss|css)$/.test(f) },
  { point: "7", re: /listen\([^)]*0\.0\.0\.0/, msg: "server must be bound to 127.0.0.1", only: isCode },
  { point: "8", re: /\b(alert|confirm)\s*\(/, msg: "alert/confirm is forbidden (toast or modal)", only: (f) => !/\.(scss|css)$/.test(f) },
  { point: "logging", re: /\bconsole\.(log|error)\s*\(/, msg: "console.log/error is forbidden, use the pino logger", only: isCode },
  { point: "env-config", re: /\bprocess\.env\b/, msg: "process.env outside src/shared/config.ts", only: (f) => isCode(f) && rel(f) !== "src/shared/config.ts" },
  {
    point: "9",
    re: /\bfetch\s*\(/,
    msg: "fetch outside src/services/ and src/shared/http-client.ts",
    only: (f) => isCode(f) && !rel(f).startsWith("src/services/") && rel(f) !== "src/shared/http-client.ts",
  },
  { point: "theme", re: /(?<!bs-)data-theme\s*=/, msg: "data-theme without the bs- prefix (use data-bs-theme)", only: (f) => !/\.(scss|css)$/.test(f) },
];
for (const f of files) {
  const lines = readFileSync(f, "utf8").split(/\r?\n/);
  for (const r of rules) {
    if (r.only && !r.only(f)) continue;
    lines.forEach((l, i) => {
      if (r.re.test(l)) add(r.point, rel(f), i + 1, r.msg);
    });
  }
}

if (!existsSync(join(root, ".env.example"))) add("env-config", ".env.example", 0, "file is missing");

// Point 16: the three versions must be equal
const ver = {};
try {
  ver["package.json"] = readFileSync(join(root, "package.json"), "utf8").match(/"version"\s*:\s*"([^"]+)"/)?.[1];
  ver["config.ts APP_VERSION"] = readFileSync(join(root, "src/shared/config.ts"), "utf8").match(/APP_VERSION\s*=\s*["']([^"']+)/)?.[1];
  ver["CHANGELOG top"] = readFileSync(join(root, "docs/release/CHANGELOG.md"), "utf8").match(/^## \[(\d+\.\d+\.\d+)\]/m)?.[1];
} catch {
  add("16", "docs/release/CHANGELOG.md", 0, "version file or changelog is unreadable");
}
if (Object.values(ver).some((v) => v === undefined) || new Set(Object.values(ver)).size > 1)
  add("16", "(versions)", 0, `versions differ or are missing: ${JSON.stringify(ver)}`);

// Point 17: .gitignore
const gi = join(root, ".gitignore");
if (!existsSync(gi)) add("17", ".gitignore", 0, "file is missing");
else {
  const set = new Set(readFileSync(gi, "utf8").split(/\r?\n/).map((l) => l.trim()));
  for (const need of ["node_modules/", "/dist/", ".env", "tasks/", ".claude/settings.local.json", ".claude/agent-memory/"])
    if (!set.has(need)) add("17", ".gitignore", 0, `missing entry: ${need}`);
  for (const bad of ["test/", ".env.example", ".claude/settings.json", "docs/release/CHANGELOG.md", "CLAUDE.md"])
    if (set.has(bad)) add("17", ".gitignore", 0, `must not ignore: ${bad}`);
}

console.log(findings.length ? `${findings.join("\n")}\n\n${findings.length} finding(s).` : "OK: no finding.");
process.exit(findings.length ? 1 : 0);
