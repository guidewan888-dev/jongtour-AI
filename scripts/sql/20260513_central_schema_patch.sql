-- Central schema patch for mixed legacy/current database
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists wholesalers (
  id text primary key,
  name text not null,
  source_type text not null default 'api',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists raw_wholesale_imports (
  id bigserial primary key,
  wholesale_id text not null,
  source_tour_key text not null,
  source_type text not null,
  payload jsonb not null,
  payload_hash text,
  extraction_status text not null default 'raw',
  need_review boolean not null default false,
  imported_at timestamptz not null default now()
);
create index if not exists idx_raw_wholesale_imports_wholesale on raw_wholesale_imports(wholesale_id);
create index if not exists idx_raw_wholesale_imports_review on raw_wholesale_imports(need_review, extraction_status);

create table if not exists canonical_tours (
  id text primary key default gen_random_uuid()::text,
  canonical_key text not null unique,
  slug text not null unique,
  title text not null,
  country text,
  city text,
  duration_days int not null default 0,
  duration_nights int not null default 0,
  is_published boolean not null default true,
  need_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_canonical_tours_published on canonical_tours(is_published);
create index if not exists idx_canonical_tours_review on canonical_tours(need_review);

create table if not exists wholesale_tour_mappings (
  id text primary key default gen_random_uuid()::text,
  canonical_tour_id text not null,
  wholesale_id text not null,
  source_tour_key text not null,
  source_tour_code text,
  source_url text,
  status text not null default 'active',
  need_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uq_wholesale_tour_mappings_wholesale_source on wholesale_tour_mappings(wholesale_id, source_tour_key);
create unique index if not exists uq_wholesale_tour_mappings_canonical_wholesale_source on wholesale_tour_mappings(canonical_tour_id, wholesale_id, source_tour_key);
create index if not exists idx_wholesale_tour_mappings_canonical on wholesale_tour_mappings(canonical_tour_id);
create index if not exists idx_wholesale_tour_mappings_wholesale on wholesale_tour_mappings(wholesale_id);

create table if not exists tour_departures (
  id text primary key default gen_random_uuid()::text,
  canonical_tour_id text,
  wholesale_id text,
  source_departure_key text,
  departure_date date,
  return_date date,
  status text not null default 'AVAILABLE',
  need_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table tour_departures alter column id set default gen_random_uuid()::text;
alter table tour_departures add column if not exists canonical_tour_id text;
alter table tour_departures add column if not exists wholesale_id text;
alter table tour_departures add column if not exists source_departure_key text;
alter table tour_departures add column if not exists need_review boolean not null default false;
alter table tour_departures add column if not exists created_at timestamptz not null default now();
alter table tour_departures add column if not exists updated_at timestamptz not null default now();
alter table tour_departures alter column tour_id drop not null;
alter table tour_departures alter column departure_date drop not null;
create unique index if not exists uq_tour_departures_wholesale_source on tour_departures(wholesale_id, source_departure_key) where wholesale_id is not null and source_departure_key is not null;
create unique index if not exists uq_tour_departures_canonical_wholesale_source on tour_departures(canonical_tour_id, wholesale_id, source_departure_key) where canonical_tour_id is not null and wholesale_id is not null and source_departure_key is not null;
create unique index if not exists uq_tour_departures_wholesale_source_full on tour_departures(wholesale_id, source_departure_key);
create unique index if not exists uq_tour_departures_canonical_wholesale_source_full on tour_departures(canonical_tour_id, wholesale_id, source_departure_key);
create index if not exists idx_tour_departures_canonical on tour_departures(canonical_tour_id, wholesale_id);
create index if not exists idx_tour_departures_date on tour_departures(departure_date);

create table if not exists tour_prices (
  id text primary key default gen_random_uuid()::text,
  departure_id text not null,
  price_type text not null default 'central',
  adult_price numeric(12,2),
  child_with_bed_price numeric(12,2),
  child_without_bed_price numeric(12,2),
  infant_price numeric(12,2),
  single_supplement_price numeric(12,2),
  deposit_amount numeric(12,2),
  deposit_type text not null default 'unknown',
  currency text not null default 'THB',
  price_source text not null default 'api',
  extraction_status text not null default 'normalized',
  need_review boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table tour_prices alter column id set default gen_random_uuid()::text;
alter table tour_prices add column if not exists price_type text not null default 'central';
alter table tour_prices add column if not exists adult_price numeric(12,2);
alter table tour_prices add column if not exists child_with_bed_price numeric(12,2);
alter table tour_prices add column if not exists child_without_bed_price numeric(12,2);
alter table tour_prices add column if not exists infant_price numeric(12,2);
alter table tour_prices add column if not exists single_supplement_price numeric(12,2);
alter table tour_prices add column if not exists deposit_amount numeric(12,2);
alter table tour_prices add column if not exists deposit_type text not null default 'unknown';
alter table tour_prices add column if not exists price_source text not null default 'api';
alter table tour_prices add column if not exists extraction_status text not null default 'normalized';
alter table tour_prices add column if not exists need_review boolean not null default false;
alter table tour_prices add column if not exists updated_at timestamptz not null default now();
alter table tour_prices add column if not exists created_at timestamptz not null default now();
alter table tour_prices alter column tour_id drop not null;
alter table tour_prices alter column amount drop not null;
alter table tour_prices alter column source drop not null;
alter table tour_prices alter column amount set default 0;
alter table tour_prices alter column source set default 'central';
create unique index if not exists uq_tour_prices_central on tour_prices(departure_id, price_type);
create index if not exists idx_tour_prices_review on tour_prices(need_review, extraction_status);

create table if not exists tour_seats (
  id text primary key default gen_random_uuid()::text,
  departure_id text not null,
  seat_total int,
  seat_available int,
  seat_booked int,
  source text not null default 'api',
  need_review boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists uq_tour_seats_departure on tour_seats(departure_id);
create index if not exists idx_tour_seats_review on tour_seats(need_review);

create table if not exists tour_pdfs (
  id text primary key default gen_random_uuid()::text,
  canonical_tour_id text,
  wholesale_id text,
  departure_id text,
  pdf_url text,
  extraction_status text not null default 'raw',
  need_review boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table tour_pdfs alter column id set default gen_random_uuid()::text;
alter table tour_pdfs add column if not exists canonical_tour_id text;
alter table tour_pdfs add column if not exists wholesale_id text;
alter table tour_pdfs add column if not exists departure_id text;
alter table tour_pdfs add column if not exists pdf_url text;
alter table tour_pdfs add column if not exists extraction_status text not null default 'raw';
alter table tour_pdfs add column if not exists need_review boolean not null default false;
alter table tour_pdfs add column if not exists is_active boolean not null default true;
alter table tour_pdfs add column if not exists created_at timestamptz not null default now();
alter table tour_pdfs add column if not exists updated_at timestamptz not null default now();
alter table tour_pdfs alter column "tourId" drop not null;
alter table tour_pdfs alter column "pdfUrl" drop not null;
create index if not exists idx_tour_pdfs_lookup on tour_pdfs(canonical_tour_id, wholesale_id, is_active);
create unique index if not exists uq_tour_pdfs_wholesale_tour_url on tour_pdfs(wholesale_id, canonical_tour_id, pdf_url) where wholesale_id is not null and canonical_tour_id is not null and pdf_url is not null;
create unique index if not exists uq_tour_pdfs_wholesale_tour_url_full on tour_pdfs(wholesale_id, canonical_tour_id, pdf_url);

create table if not exists sync_logs (
  id text primary key default gen_random_uuid()::text,
  wholesale_id text,
  sync_type text,
  status text,
  message text,
  records_added int not null default 0,
  records_updated int not null default 0,
  records_failed int not null default 0,
  created_at timestamptz not null default now()
);
alter table sync_logs alter column id set default gen_random_uuid()::text;
alter table sync_logs add column if not exists wholesale_id text;
alter table sync_logs add column if not exists sync_type text;
alter table sync_logs add column if not exists message text;
alter table sync_logs add column if not exists records_added int not null default 0;
alter table sync_logs add column if not exists records_updated int not null default 0;
alter table sync_logs add column if not exists records_failed int not null default 0;
alter table sync_logs add column if not exists created_at timestamptz not null default now();
create index if not exists idx_sync_logs_created_at on sync_logs(created_at desc);
create index if not exists idx_sync_logs_wholesale on sync_logs(wholesale_id, created_at desc);

create table if not exists booking_central_snapshots (
  id text primary key default gen_random_uuid()::text,
  booking_id text not null unique,
  central_tour_id text,
  central_departure_id text,
  wholesale_id text,
  price_snapshot jsonb,
  seat_snapshot jsonb,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table bookings add column if not exists central_tour_id text;
alter table bookings add column if not exists central_departure_id text;
alter table bookings add column if not exists seat_snapshot jsonb;
alter table bookings add column if not exists pdf_url text;
