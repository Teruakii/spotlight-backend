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

const sql = execFileSync(
  "npx",
  ["prisma", "migrate", "diff", "--from-schema", fromPath, "--to-schema", "prisma/schema.prisma", "--script"],
  { cwd: root, shell: true, encoding: "utf8" },
);

if (!sql.trim() || /This is an empty migration/.test(sql)) {
  console.error("schema.prisma has no changes against HEAD; nothing to write.");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const dir = path.join(root, "prisma", "migrations", `${stamp}_${name}`);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "migration.sql"), sql);
console.log(`Wrote ${path.relative(root, dir)}/migration.sql`);
