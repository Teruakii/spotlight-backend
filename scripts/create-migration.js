// Writes prisma/migrations/<timestamp>_<name>/migration.sql from the difference
// between the committed prisma/schema.prisma (git HEAD) and the working copy.
// Needs no database connection, so it never touches a real database.
// Usage: npm run db:migration:create -- <name>
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const name = process.argv[2];
if (!name || !/^[a-z0-9_]+$/.test(name)) {
  console.error("Usage: npm run db:migration:create -- <snake_case_name>");
  process.exit(1);
}

const root = path.resolve(__dirname, "..");
const committedSchema = execFileSync("git", ["show", "HEAD:prisma/schema.prisma"], { cwd: root });
const fromPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "schema-")), "schema.prisma");
fs.writeFileSync(fromPath, committedSchema);

const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const dir = path.join(root, "prisma", "migrations", `${stamp}_${name}`);
const outPath = path.join(dir, "migration.sql");
fs.mkdirSync(dir, { recursive: true });

const prismaCli = require.resolve("prisma/build/index.js", { paths: [root] });
execFileSync(
  process.execPath,
  [prismaCli, "migrate", "diff", "--from-schema", fromPath, "--to-schema", "prisma/schema.prisma", "--script", "--output", outPath],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"], env: { ...process.env, DOTENV_CONFIG_QUIET: "true" } },
);

const sql = fs.readFileSync(outPath, "utf8");
if (!sql.trim() || /This is an empty migration/.test(sql)) {
  fs.rmSync(dir, { recursive: true });
  console.error("schema.prisma has no changes against HEAD; nothing to write.");
  process.exit(1);
}

console.log(`Wrote ${path.relative(root, dir)}/migration.sql`);
