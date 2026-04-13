-- Table des invitations (tokens sécurisés)
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

-- N'importe qui peut lire une invitation via son token (pour la page /invite/:token)
CREATE POLICY "Lecture publique d'un token"
  ON public.invitations FOR SELECT
  USING ( true );

-- Ajouter les colonnes profil enrichi sur profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS siret text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS iban text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS orias text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
