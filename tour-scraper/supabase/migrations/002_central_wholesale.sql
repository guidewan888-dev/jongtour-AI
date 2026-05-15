-- ============================================================
-- Central Wholesale Schema (canonical source of truth)
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists wholesalers (
  id                text primary key,
  name              text not null,
  source_type       text not null check (source_type in ('api', 'scraper')),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists raw_wholesale_imports (
  id                bigserial primary key,
  wholesale_id      text not null references wholesalers(id) on delete cascade,
  source_tour_key   text not null,
  source_type       text not null check (source_type in ('api', 'scraper')),
  payload           jsonb not null,
  payload_hash      text,
  extraction_status text not null default 'raw',
  need_review       boolean not null default false,
  imported_at       timestamptz not null default now(),
  unique (wholesale_id, source_tour_key, imported_at)
);

create index if not exists idx_raw_wholesale_imports_wholesale on raw_wholesale_imports(wholesale_id);
create index if not exists idx_raw_wholesale_imports_review on raw_wholesale_imports(need_review, extraction_status);

create table if not exists canonical_tours (
  id                uuid primary key default gen_random_uuid(),
  canonical_key     text not null unique,
  slug              text not null unique,
  title             text not null,
  country           text,
  city              text,
  duration_days     int not null default 0,
  duration_nights   int not null default 0,
  is_published      boolean not null default true,
  need_review       boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_canonical_tours_published on canonical_tours(is_published);
create index if not exists idx_canonical_tours_review on canonical_tours(need_review);

create table if not exists wholesale_tour_mappings (
  id                uuid primary key default gen_random_uuid(),
  canonical_tour_id uuid not null references canonical_tours(id) on delete cascade,
  wholesale_id      text not null references wholesalers(id) on delete cascade,
  source_tour_key   text not null,
  source_tour_code  text,
  source_url        text,
  status            text not null default 'active',
  need_review       boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (wholesale_id, source_tour_key),
  unique (canonical_tour_id, wholesale_id, source_tour_key)
);

create index if not exists idx_wholesale_tour_mappings_canonical on wholesale_tour_mappings(canonical_tour_id);
create index if not exists idx_wholesale_tour_mappings_wholesale on wholesale_tour_mappings(wholesale_id);

create table if not exists tour_departures (
  id                    uuid primary key default gen_random_uuid(),
  canonical_tour_id     uuid not null references canonical_tours(id) on delete cascade,
  wholesale_id          text not null references wholesalers(id) on delete cascade,
  source_departure_key  text not null,
  departure_date        date,
  return_date           date,
  status                text not null default 'AVAILABLE',
  need_review           boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (wholesale_id, source_departure_key),
  unique (canonical_tour_id, wholesale_id, source_departure_key)
);

create index if not exists idx_tour_departures_canonical on tour_departures(canonical_tour_id, wholesale_id);
create index if not exists idx_tour_departures_date on tour_departures(departure_date);

create table if not exists tour_prices (
  id                         uuid primary key default gen_random_uuid(),
  departure_id               uuid not null references tour_departures(id) on delete cascade,
  adult_price                numeric(12, 2),
  child_with_bed_price       numeric(12, 2),
  child_without_bed_price    numeric(12, 2),
  infant_price               numeric(12, 2),
  single_supplement_price    numeric(12, 2),
  deposit_amount             numeric(12, 2),
  deposit_type               text not null default 'unknown' check (deposit_type in ('per_person', 'per_booking', 'unknown')),
  currency                   text not null default 'THB',
  price_source               text not null default 'api',
  extraction_status          text not null default 'normalized',
  need_review                boolean not null default false,
  updated_at                 timestamptz not null default now(),
  unique (departure_id)
);

create index if not exists idx_tour_prices_review on tour_prices(need_review, extraction_status);

create table if not exists tour_seats (
  id                         uuid primary key default gen_random_uuid(),
  departure_id               uuid not null references tour_departures(id) on delete cascade,
  seat_total                 int,
  seat_available             int,
  seat_booked                int,
  source                     text not null default 'api',
  need_review                boolean not null default false,
  updated_at                 timestamptz not null default now(),
  unique (departure_id)
);

create index if not exists idx_tour_seats_review on tour_seats(need_review);

create table if not exists tour_pdfs (
  id                         uuid primary key default gen_random_uuid(),
  canonical_tour_id          uuid not null references canonical_tours(id) on delete cascade,
  wholesale_id               text not null references wholesalers(id) on delete cascade,
  departure_id               uuid references tour_departures(id) on delete cascade,
  pdf_url                    text not null,
  extraction_status          text not null default 'raw',
  need_review                boolean not null default false,
  is_active                  boolean not null default true,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index if not exists idx_tour_pdfs_lookup on tour_pdfs(canonical_tour_id, wholesale_id, is_active);
create unique index if not exists uq_tour_pdfs_wholesale_tour_url
  on tour_pdfs (wholesale_id, canonical_tour_id, pdf_url);
create unique index if not exists uq_tour_pdfs_unique
  on tour_pdfs (wholesale_id, canonical_tour_id, coalesce(departure_id, '00000000-0000-0000-0000-000000000000'::uuid), pdf_url);

create table if not exists sync_logs (
  id                         bigserial primary key,
  wholesale_id               text references wholesalers(id) on delete set null,
  sync_type                  text not null,
  status                     text not null,
  message                    text,
  records_added              int not null default 0,
  records_updated            int not null default 0,
  records_failed             int not null default 0,
  created_at                 timestamptz not null default now()
);

create index if not exists idx_sync_logs_created_at on sync_logs(created_at desc);
create index if not exists idx_sync_logs_wholesale on sync_logs(wholesale_id, created_at desc);
