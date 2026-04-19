-- =============================================================
-- Oriafilia Partners — Supabase Schema Setup
-- =============================================================

-- 1. Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 2. Table des Profils (Partenaires et Admins)
-- =============================================================
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  phone text,
  siret text,
  iban text,
  orias text,
  address text,
  role text NOT NULL CHECK (role IN ('admin', 'partner')) DEFAULT 'partner',
  status text NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS pour les profils
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fonction helper : est-ce un admin ?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- L'admin voit tous les profils
CREATE POLICY "Les admins voient tous les profils"
  ON public.profiles FOR SELECT
  USING ( public.is_admin() );

-- Chaque utilisateur voit son propre profil
CREATE POLICY "Les utilisateurs voient leur propre profil"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

-- Chaque utilisateur peut modifier son propre profil
CREATE POLICY "Les utilisateurs modifient leur propre profil"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- L'admin peut modifier tous les profils (rôles, statuts)
CREATE POLICY "Les admins modifient tous les profils"
  ON public.profiles FOR UPDATE
  USING ( public.is_admin() );

-- =============================================================
-- 3. Table des Leads
-- =============================================================
CREATE TABLE public.leads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  contact_name text NOT NULL,
  email text,
  phone text NOT NULL,
  product_type text NOT NULL,
  situation text,
  source text,
  estimated_premium numeric DEFAULT 0,
  commission_rate numeric DEFAULT 10,
  commission numeric DEFAULT 0,
  partner_id uuid REFERENCES public.profiles(id) NOT NULL,
  status text NOT NULL CHECK (status IN (
    'nouveau', 'contacte', 'qualifie', 'devis_envoye', 'gagne', 'perdu'
  )) DEFAULT 'nouveau',
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_leads_updated
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS pour les leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- L'admin voit et modifie tous les leads
CREATE POLICY "Admin a tout accès sur les leads"
  ON public.leads FOR ALL
  USING ( public.is_admin() );

-- Les partenaires voient uniquement leurs leads
CREATE POLICY "Les partenaires voient leurs leads"
  ON public.leads FOR SELECT
  USING ( partner_id = auth.uid() );

-- Les partenaires peuvent insérer des leads pour eux-mêmes
CREATE POLICY "Les partenaires peuvent créer des leads"
  ON public.leads FOR INSERT
  WITH CHECK ( partner_id = auth.uid() );

-- Les partenaires peuvent modifier leurs propres leads (notes, etc.)
CREATE POLICY "Les partenaires peuvent modifier leurs leads"
  ON public.leads FOR UPDATE
  USING ( partner_id = auth.uid() );

-- =============================================================
-- 4. Trigger pour créer un profil à chaque inscription
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'partner',
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================
-- 5. Table des Invitations
-- =============================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text NOT NULL,
  token uuid DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  used_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '7 days')
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent créer/gérer des invitations
CREATE POLICY "Admins gèrent les invitations"
  ON public.invitations FOR ALL
  USING ( public.is_admin() );

-- N'importe qui peut lire une invitation via son token (page /invite/:token)
CREATE POLICY "Lecture publique d'un token"
  ON public.invitations FOR SELECT
  USING ( true );

-- =============================================================
-- 6. RPC pour réinitialisation de mot de passe (Admin)
-- =============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.admin_reset_password(
  target_user_id uuid,
  new_password text
) RETURNS void AS $$
BEGIN
  -- Vérifier que l'utilisateur exécutant est bien un admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé. Seuls les administrateurs peuvent effectuer cette action.';
  END IF;

  -- Mettre à jour le mot de passe hashé
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf', 10)),
      updated_at = now()
  WHERE id = target_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
