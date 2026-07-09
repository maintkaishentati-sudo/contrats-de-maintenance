-- Schéma de base de données pour l'application Contrats de maintenance
-- À exécuter dans Supabase > SQL Editor

create extension if not exists pgcrypto;

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  societe text not null,
  equipement text,
  objet text not null,
  date_debut date,
  date_fin date not null,
  montant numeric,
  reconduction_tacite boolean not null default false,
  preavis_jours integer not null default 90,
  visites_par_an integer not null default 0,
  derniere_visite date,
  notes text,
  statut text not null default 'actif',
  motif_fin text,
  contrat_precedent_id uuid references contracts(id),
  created_at timestamptz not null default now()
);

alter table contracts enable row level security;

create policy "select own contracts" on contracts for select using (auth.uid() = user_id);
create policy "insert own contracts" on contracts for insert with check (auth.uid() = user_id);
create policy "update own contracts" on contracts for update using (auth.uid() = user_id);
create policy "delete own contracts" on contracts for delete using (auth.uid() = user_id);

create index if not exists contracts_user_id_idx on contracts (user_id);
create index if not exists contracts_statut_idx on contracts (statut);
