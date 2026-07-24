#!/usr/bin/env node
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const root = resolve(__dirname, '..');
  const files = ['.env.local', '.env'];
  for (const f of files) {
    const p = resolve(root, f);
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function main() {
  loadEnv();

  const mongoUri = process.env.MONGODB_URI || process.env.MONGODBURI;
  if (!mongoUri) {
    console.error('MONGODB_URI or MONGODBURI not found in environment or .env file');
    process.exit(1);
  }

  const email = 'admin@gmail.com';
  const password = 'admin1';

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  const db = mongoose.connection.db;
  const admins = db.collection('admins');

  const existing = await admins.findOne({ email });
  if (existing) {
    console.log(`Admin with email "${email}" already exists.`);
    await mongoose.disconnect();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const result = await admins.insertOne({
    name: 'Admin',
    email,
    password: hashedPassword,
    role: 'admin',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`Admin created successfully:`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  ID:       ${result.insertedId}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
