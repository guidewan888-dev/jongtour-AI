-- Central quality tracking tables

create table if not exists sync_quality_reports (
  id text primary key default gen_random_uuid()::text,
  wholesale_id text not null,
  generated_at timestamptz not null default now(),
  status text not null default 'PARTIAL',
  total_mapped_tours int not null default 0,
  total_departures int not null default 0,
  complete_departures int not null default 0,
  missing_departure_count int not null default 0,
  missing_adult_price_count int not null default 0,
  missing_deposit_count int not null default 0,
  missing_seat_count int not null default 0,
  missing_pdf_count int not null default 0,
  invalid_seat_count int not null default 0,
  completeness_percent numeric(6,2) not null default 0,
  summary jsonb not null default '{}'::jsonb
);

create index if not exists idx_sync_quality_reports_wholesale_time
  on sync_quality_reports(wholesale_id, generated_at desc);

create table if not exists sync_quality_issues (
  id text primary key default gen_random_uuid()::text,
  report_id text references sync_quality_reports(id) on delete cascade,
  wholesale_id text not null,
  canonical_tour_id text,
  departure_id text,
  issue_code text not null,
  severity text not null default 'warning',
  field_name text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_sync_quality_issues_wholesale_time
  on sync_quality_issues(wholesale_id, created_at desc);

create index if not exists idx_sync_quality_issues_open
  on sync_quality_issues(resolved, created_at desc);
