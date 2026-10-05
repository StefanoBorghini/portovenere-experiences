-- =====================================================================
-- events — nuova sezione "Eventi" del configuratore (DJ set ricorrenti,
-- open day, feste a data fissa...), distinta dalle Experience: niente
-- prezzo/ospiti/mood, solo titolo/descrizione/immagine/link e una
-- ricorrenza. Tabella dedicata (non experience_content) per non far
-- comparire gli eventi nel motore di matching/scoring esistente
-- (generateProposal.ts) — quel motore non interroga questa tabella,
-- quindi zero rischio di contaminare il filtro esperienze attuale.
--
-- Nessuna policy RLS pubblica: stesso trattamento di operators/
-- partner_applications, ogni accesso passa dalla service role key via
-- le route /api/admin/events/*.
--
-- IDEMPOTENTE: create table if not exists, sicura da rilanciare.
-- =====================================================================

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  title text not null,
  description text,
  image_url text,

  -- Link di destinazione di default (pagina evento auto-generata se
  -- vuoto, altrimenti un link esterno/personalizzato). Sovrascrivibile
  -- per singola occorrenza — vedi event_availability_dates.link_override.
  link_default text,

  active boolean not null default true
);

alter table events enable row level security;

-- =====================================================================
-- event_availability_weekdays — definisce la RICORRENZA di un evento
-- (es. "ogni mercoledì" -> una riga con weekday=3). A differenza
-- dell'equivalente per le Experience, qui non serve un campo status
-- whitelist/blacklist: la sola presenza di una riga è la regola.
-- Nessuna riga = evento non ricorrente (singole date in
-- event_availability_dates).
-- =====================================================================

create table if not exists event_availability_weekdays (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), -- 0=domenica .. 6=sabato (Date.getDay())
  created_at timestamptz not null default now(),
  unique (event_id, weekday)
);

alter table event_availability_weekdays enable row level security;

-- =====================================================================
-- event_availability_dates — doppio uso secondo se l'evento è
-- ricorrente o unico:
--   - Evento SENZA righe in event_availability_weekdays: ogni riga qui
--     con status='scheduled' è una occorrenza reale (evento unico, o
--     serie di date singole).
--   - Evento CON righe in event_availability_weekdays: le occorrenze
--     sono generate espandendo la ricorrenza; una riga qui serve solo
--     a sovrascrivere un'occorrenza puntuale — status='cancelled' per
--     annullarla (es. "niente DJ set questo mercoledì"), o
--     link_override per darle un link diverso da quello di default
--     (es. l'iscrizione dell'open day di pilates cambia ogni volta).
-- =====================================================================

create table if not exists event_availability_dates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  date date not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  link_override text,
  note text,
  created_at timestamptz not null default now(),
  unique (event_id, date)
);

alter table event_availability_dates enable row level security;

create index if not exists events_active_idx on events (active);
create index if not exists event_availability_weekdays_event_id_idx on event_availability_weekdays (event_id);
create index if not exists event_availability_dates_event_id_idx on event_availability_dates (event_id);
create index if not exists event_availability_dates_date_idx on event_availability_dates (date);
