/**
 * One-shot Supabase setup script (run locally, NOT in the browser).
 *
 * What it does:
 * 1) Creates tables auth_audit and registration_emails
 * 2) Enables RLS
 * 3) Adds anon insert policies so your frontend can write logs / email marks
 *
 * Usage:
 *   npm install pg
 *   SUPABASE_DB_URL="postgres://<user>:<pass>@<host>:5432/postgres" node db_setup.js
 *
 * Notes:
 * - Use the "Connection string (URI)" from Supabase Dashboard → Database.
 * - Keep SUPABASE_DB_URL secret; do not commit it.
 * - Safe to re-run (idempotent: create table if not exists / policy if not exists).
 */
import { Client } from 'pg';

const DB_URL = process.env.SUPABASE_DB_URL;
if (!DB_URL) {
  console.error('Missing env SUPABASE_DB_URL');
  process.exit(1);
}

const sql = `
create extension if not exists pgcrypto;

create table if not exists auth_audit (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  mode text not null,            -- login | register
  created_at timestamptz not null default now()
);

create table if not exists registration_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  sent_at timestamptz not null default now()
);

alter table auth_audit enable row level security;
alter table registration_emails enable row level security;

create policy if not exists "auth_audit insert" on auth_audit
for insert to anon with check (true);

create policy if not exists "registration_emails insert" on registration_emails
for insert to anon with check (true);
`;

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Supabase DB setup completed.');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});

