// Prisma Migrate's CLI can't target libsql:// URLs directly, so schema
// changes are developed locally against prisma/dev.db as usual, then pushed
// here by replaying the migration SQL files against Turso directly. Same
// reason F:\shop-products\nextjs-shop-main has its own migrate-to-turso.ts.
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    console.error('Set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) before running this.');
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  const dirs = fs
    .readdirSync(migrationsDir)
    .filter(d => fs.statSync(path.join(migrationsDir, d)).isDirectory())
    .sort();

  for (const dir of dirs) {
    const sqlPath = path.join(migrationsDir, dir, 'migration.sql');
    if (!fs.existsSync(sqlPath)) continue;
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Applying ${dir} (${statements.length} statement(s))...`);
    for (const stmt of statements) {
      await client.execute(stmt);
    }
  }

  console.log('Schema pushed to Turso.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
