-- =====================================================================
-- Availability / Calendar — screening di compatibilita' esperienze
-- (ed enhancement) con le date scelte dal cliente nel configuratore.
-- =====================================================================
-- NON e' un sistema di prenotazione: e' pre-filtering. Un'esperienza
-- "available" per le date scelte significa solo "compatibile con il
-- periodo", non "confermata" — la conferma reale resta al Concierge
-- (verifica manuale con l'operatore) e poi alla prenotazione.
--
-- Priorita' di risoluzione (dalla piu' alla meno specifica):
--   1. Manual override   (experience_availability_dates, source='manual')
--   2. Specific exception (experience_availability_dates, source='exception')
--   3. Weekday rule       (experience_availability_weekdays)
--   4. Seasonal rule      (experience_availability_seasons)
--   5. Default            (available — nessuna regola configurata)
-- Vedi src/lib/availability/resolveAvailability.ts per la logica.
--
-- Nessuna riga in nessuna delle tre tabelle per un'esperienza = sempre
-- disponibile (comportamento invariato per tutte le esperienze/
-- enhancement esistenti finche' nessuno configura regole per loro).
--
-- ID come TEXT (non uuid con default): experience_content.id e'
-- confermato testo generato lato client (es. "new-experience-171...",
-- "dup-tier-171...", vedi createExperience()/duplicateExperience() in
-- experienceRepository.ts) — stesso trattamento qui, cosi' l'editor
-- admin puo' riusare l'identico pattern "id: `new-season-${Date.now()}`"
-- gia' in uso da PriceTiersCard.tsx/SeasonalPricingCard.tsx.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ESPERIENZE
-- ---------------------------------------------------------------------

-- Stagionale — SENZA anno (mese+giorno): le finestre sono ricorrenti
-- ogni anno (es. parapendio: ottobre->maggio OGNI anno, non solo nel
-- 2026). start_month/day > end_month/day e' un caso valido e normale
-- (indica un periodo che attraversa il capodanno, es. 10/1 -> 5/31) —
-- gestito dal confronto lato applicazione, non qui.
create table if not exists experience_availability_seasons (
  id text primary key,
  experience_id text not null references experience_content(id) on delete cascade,
  status text not null check (status in ('available', 'unavailable')),
  start_month smallint not null check (start_month between 1 and 12),
  start_day smallint not null check (start_day between 1 and 31),
  end_month smallint not null check (end_month between 1 and 12),
  end_day smallint not null check (end_day between 1 and 31),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists experience_availability_seasons_experience_id_idx
  on experience_availability_seasons(experience_id);

-- Giorni della settimana ricorrenti — 0=domenica..6=sabato (stessa
-- convenzione di Date.getDay() in JS). Se esistono righe 'available',
-- SOLO quei giorni sono ammessi (whitelist); se esistono solo righe
-- 'unavailable', tutti gli altri giorni restano ammessi (blacklist).
-- Nessuna riga = nessun vincolo sul giorno della settimana.
create table if not exists experience_availability_weekdays (
  id text primary key,
  experience_id text not null references experience_content(id) on delete cascade,
  status text not null check (status in ('available', 'unavailable')),
  weekday smallint not null check (weekday between 0 and 6),
  created_at timestamptz not null default now()
);

create index if not exists experience_availability_weekdays_experience_id_idx
  on experience_availability_weekdays(experience_id);

-- Copre sia le "eccezioni" a una regola generale (source='exception',
-- es. "normalmente disponibile, ma il 15 agosto no") sia gli
-- "override manuali" impostati direttamente da Stefano
-- (source='manual', priorita' massima) — stessa forma di riga, la
-- colonna source decide solo l'ordine di priorita' tra le due. Data
-- reale con anno (non ricorrente): resta semplice per ora, come
-- richiesto — un'eccezione ricorrente ogni anno va reinserita.
create table if not exists experience_availability_dates (
  id text primary key,
  experience_id text not null references experience_content(id) on delete cascade,
  date date not null,
  status text not null check (status in ('available', 'unavailable')),
  source text not null default 'manual' check (source in ('manual', 'exception')),
  note text,
  created_at timestamptz not null default now(),
  unique (experience_id, date, source)
);

create index if not exists experience_availability_dates_experience_id_idx
  on experience_availability_dates(experience_id);

-- Un'esperienza "a occorrenza fissa" (es. un evento con UNA sola data
-- reale) non deve mai ricevere disponibilita' "inventata" da una
-- finestra stagionale generica quando il cliente chiede un intervallo
-- di piu' giorni: serve una riga ESPLICITA in
-- experience_availability_dates per quella data precisa. Default
-- false: il comportamento comune (esperienza ricorrente/flessibile)
-- resta quello attuale.
alter table experience_content add column if not exists requires_specific_date boolean not null default false;

-- ---------------------------------------------------------------------
-- ENHANCEMENT — stesso identico schema, stessa logica di risoluzione.
-- Un enhancement senza nessuna riga in queste tre tabelle resta sempre
-- disponibile di default, come le esperienze.
--
-- NESSUN vincolo di foreign key qui verso enhancement_content(id): a
-- differenza di experience_content (confermato text), il tipo esatto
-- della colonna id di enhancement_content non e' stato verificabile da
-- codice — invece di rischiare un fallimento della migration per un
-- mismatch di tipo, resta una colonna text indicizzata ma senza
-- "references". L'integrita' referenziale la garantisce comunque
-- l'applicazione (stesso trattamento gia' riservato altrove in questo
-- schema a colonne collegate senza FK esplicita).
-- ---------------------------------------------------------------------

create table if not exists enhancement_availability_seasons (
  id text primary key,
  enhancement_id text not null,
  status text not null check (status in ('available', 'unavailable')),
  start_month smallint not null check (start_month between 1 and 12),
  start_day smallint not null check (start_day between 1 and 31),
  end_month smallint not null check (end_month between 1 and 12),
  end_day smallint not null check (end_day between 1 and 31),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists enhancement_availability_seasons_enhancement_id_idx
  on enhancement_availability_seasons(enhancement_id);

create table if not exists enhancement_availability_weekdays (
  id text primary key,
  enhancement_id text not null,
  status text not null check (status in ('available', 'unavailable')),
  weekday smallint not null check (weekday between 0 and 6),
  created_at timestamptz not null default now()
);

create index if not exists enhancement_availability_weekdays_enhancement_id_idx
  on enhancement_availability_weekdays(enhancement_id);

create table if not exists enhancement_availability_dates (
  id text primary key,
  enhancement_id text not null,
  date date not null,
  status text not null check (status in ('available', 'unavailable')),
  source text not null default 'manual' check (source in ('manual', 'exception')),
  note text,
  created_at timestamptz not null default now(),
  unique (enhancement_id, date, source)
);

create index if not exists enhancement_availability_dates_enhancement_id_idx
  on enhancement_availability_dates(enhancement_id);

alter table enhancement_content add column if not exists requires_specific_date boolean not null default false;
