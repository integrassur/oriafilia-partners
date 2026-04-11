-- 1. Activer l'extension UUID
create extension if not exists "uuid-ossp";

-- 2. Création de la table des profils (Partenaires et Admins)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  role text not null check (role in ('admin', 'partner')),
  status text not null check (status in ('active', 'inactive')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) pour les profils
alter table public.profiles enable row level security;

-- L'admin voit tous les profils
create policy "Les admins voient tous les profils"
  on public.profiles for select
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- Chaque utilisateur voit son propre profil
create policy "Les utilisateurs voient leur propre profil"
  on public.profiles for select
  using ( auth.uid() = id );


-- 3. Création de la table des Leads
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  phone text not null,
  client_type text not null,
  has_insurance text,
  postal_code text,
  partner_id uuid references public.profiles(id) not null,
  status text not null check (status in ('nouveau', 'en_cours', 'gagne', 'perdu')) default 'nouveau',
  status_date text,
  commission numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text
);

-- RLS (Row Level Security) pour les leads
alter table public.leads enable row level security;

-- L'admin voit et modifie tous les leads
create policy "Admin a tout accès sur les leads"
  on public.leads for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- Les partenaires voient uniquement leurs leads
create policy "Les partenaires voient leurs leads"
  on public.leads for select
  using ( partner_id = auth.uid() );

-- Les partenaires peuvent insérer des leads pour eux-mêmes
create policy "Les partenaires peuvent créer des leads"
  on public.leads for insert
  with check ( partner_id = auth.uid() );

-- 4. Trigger automatique pour créer un profil à chaque nouvelle inscription (Signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, status)
  values (new.id, new.email, 'partner', 'active');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
