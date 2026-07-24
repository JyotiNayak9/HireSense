#!/usr/bin/env node
import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const root = resolve(__dirname, '..');
  for (const f of ['.env.local', '.env']) {
    const p = resolve(root, f);
    if (existsSync(p)) {
      for (const line of readFileSync(p, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

async function main() {
  loadEnv();

  const mongoUri = process.env.MONGODB_URI || process.env.MONGODBURI;
  if (!mongoUri) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

  const db = mongoose.connection.db;
  const companies = db.collection('companies');

  const result = await companies.updateMany(
    { $or: [{ status: { $exists: false } }, { status: null }] },
    { $set: { status: 'approved' } }
  );

  console.log(`Updated ${result.modifiedCount} companies with status: approved`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
