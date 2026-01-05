-- NETTOYAGE (Optionnel, pour repartir propre si besoin)
-- drop table if exists pack_items cascade;
-- drop table if exists packs cascade;
-- drop table if exists projects cascade;
-- drop table if exists gear_items cascade;
-- drop type if exists gear_status cascade;

-- 1. GEAR ITEMS (Le "Garage" : Stock physique global)
create type gear_status as enum ('owned', 'wishlist', 'ordered', 'borrowed', 'archived');

create table public.gear_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  weight_g integer not null default 0,
  category text not null, -- 'sleep', 'shelter', 'kitchen', 'wear', 'tech', 'hygiene'
  status gear_status default 'owned',
  notes text,
  brand text,
  price_paid_cents integer,
  created_at timestamp with time zone default now()
);

-- 2. PROJECTS (Les Expéditions temporelles)
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null, -- ex: "GR20 Juin"
  slug text, -- lien optionnel vers data statique
  start_date date not null,
  end_date date not null,
  is_template boolean default false,
  base_weight_goal integer, 
  created_at timestamp with time zone default now()
);

-- 3. PACKS (Le Contenant Logique)
create table public.packs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users not null,
  name text default 'Configuration Principale',
  created_at timestamp with time zone default now()
);

-- 4. PACK ITEMS (Le Contenu / Association)
create table public.pack_items (
  id uuid default gen_random_uuid() primary key,
  pack_id uuid references public.packs(id) on delete cascade,
  gear_item_id uuid references public.gear_items(id), -- Nullable si item virtuel
  
  -- Surcharge locale
  quantity integer default 1,
  is_worn boolean default false,
  sort_order integer default 0,
  
  -- Ghost Mode (Suggestions IA)
  is_ghost boolean default false,
  ghost_label text, -- ex: "Duvet 0°C conseillé"
  
  created_at timestamp with time zone default now()
);

-- INDEX & SECURITE (RLS)
create index idx_project_dates on public.projects (start_date, end_date);
create index idx_pack_items_gear on public.pack_items (gear_item_id);

alter table gear_items enable row level security;
alter table projects enable row level security;
alter table packs enable row level security;
alter table pack_items enable row level security;

create policy "Own Gear" on gear_items for all using (auth.uid() = user_id);
create policy "Own Projects" on projects for all using (auth.uid() = user_id);
create policy "Own Packs" on packs for all using (auth.uid() = user_id);
create policy "Own Pack Items" on pack_items using (
  exists (select 1 from packs where id = pack_items.pack_id and user_id = auth.uid())
);

-- 5. FONCTION RPC POUR DÉTECTION DE CONFLITS
-- Vérifie si un item est utilisé dans un AUTRE projet qui chevauche les dates données
create or replace function check_gear_availability(
  check_gear_id uuid,
  check_start_date date,
  check_end_date date,
  exclude_project_id uuid -- Pour ne pas compter le projet actuel comme un conflit
)
returns table (project_name text, start_date date, end_date date) 
language plpgsql
as $$
begin
  return query
  select p.name, p.start_date, p.end_date
  from pack_items pi
  join packs pk on pi.pack_id = pk.id
  join projects p on pk.project_id = p.id
  where pi.gear_item_id = check_gear_id
    and pi.is_ghost = false -- On ignore les suggestions non validées
    and p.id != exclude_project_id
    and (p.start_date, p.end_date) overlaps (check_start_date, check_end_date);
end;
$$;
