-- PDF extraction queue for central wholesale normalization

create extension if not exists pgcrypto;

create table if not exists pdf_extraction_jobs (
  id text primary key default gen_random_uuid()::text,
  job_key text not null unique,
  wholesale_id text not null,
  canonical_tour_id text,
  departure_id text,
  pdf_url text not null,
  source_hint text,
  status text not null default 'pending', -- pending, processing, completed, failed, retry
  attempts int not null default 0,
  priority int not null default 0,
  last_error text,
  extraction_result jsonb not null default '{}'::jsonb,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pdf_extraction_jobs_status_priority
  on pdf_extraction_jobs(status, priority desc, updated_at asc);

create index if not exists idx_pdf_extraction_jobs_wholesale
  on pdf_extraction_jobs(wholesale_id, status, updated_at desc);

