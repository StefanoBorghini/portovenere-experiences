-- =====================================================================
-- Sposta la gestione dell'incompatibilita' Experience <-> Enhancement
-- dalla scheda Experience alla scheda Enhancement.
--
-- Prima: experience_content.incompatible_enhancements (text[] di id
-- enhancement), editata solo dalla scheda Experience.
-- Dopo:  enhancement_content.incompatible_experiences (text[] di id
-- experience), editata solo dalla scheda Enhancement.
--
-- Stessa tecnica (array sulla riga, nessuna tabella many-to-many),
-- solo spostata di tabella e invertita di direzione. Il default
-- rimane "compatibile": un id assente dall'array non e' mai
-- incompatibile.
-- =====================================================================

alter table enhancement_content
  add column if not exists incompatible_experiences text[] default '{}';

-- ---------------------------------------------------------------------
-- Backfill: inverte i dati esistenti senza perdita. Per ogni Experience
-- che dichiarava un Enhancement incompatibile, aggiunge l'id della
-- Experience nella nuova lista dell'Enhancement (dedup con l'unione di
-- array). Racchiuso in un controllo sulla vecchia colonna cosi' la
-- migrazione resta sicura da rieseguire anche dopo che la colonna e'
-- gia' stata droppata (stesso standard "if exists" del resto del file).
-- ---------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'experience_content'
      and column_name = 'incompatible_enhancements'
  ) then
    update enhancement_content e
    set incompatible_experiences = (
      select array_agg(distinct x)
      from (
        select unnest(e.incompatible_experiences) as x
        union
        select ec.id::text
        from experience_content ec
        where e.id::text = any (ec.incompatible_enhancements)
      ) s
    )
    where exists (
      select 1
      from experience_content ec
      where e.id::text = any (ec.incompatible_enhancements)
    );
  end if;
end $$;

-- ---------------------------------------------------------------------
-- La vecchia colonna e' completamente superata dalla nuova: tenerla
-- creerebbe due punti di configurazione indipendenti per la stessa
-- relazione, che e' esattamente cio' che questa modifica vuole evitare.
-- ---------------------------------------------------------------------

alter table experience_content
  drop column if exists incompatible_enhancements;
