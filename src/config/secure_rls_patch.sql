-- =============================================================
-- Patch de Sécurité RLS - Oriafilia Partners
-- =============================================================

-- 1. Sécurisation de la table `profiles`
CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS trigger AS $$
BEGIN
  -- Si l'utilisateur n'est pas admin, on bloque la modification de role et status
  IF NOT public.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Accès refusé : Impossible de modifier son propre rôle ou statut.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update_prevent_escalation ON public.profiles;
CREATE TRIGGER on_profile_update_prevent_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_profile_escalation();

-- 2. Sécurisation de la table `leads`
CREATE OR REPLACE FUNCTION public.secure_lead_data()
RETURNS trigger AS $$
BEGIN
  -- Si c'est un admin, tout est permis
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Pour un partenaire (non-admin) :
  IF TG_OP = 'INSERT' THEN
    -- Forcer les valeurs par défaut sécurisées à l'insertion
    NEW.status := 'nouveau';
    NEW.commission := 0;
    NEW.estimated_premium := COALESCE(NEW.estimated_premium, 0);
    -- On s'assure qu'il crée bien pour lui-même (la policy RLS le fait déjà, mais par sécurité)
    NEW.partner_id := auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    -- Bloquer la modification des champs financiers/statut
    IF NEW.status IS DISTINCT FROM OLD.status OR
       NEW.commission IS DISTINCT FROM OLD.commission OR
       NEW.commission_rate IS DISTINCT FROM OLD.commission_rate OR
       NEW.estimated_premium IS DISTINCT FROM OLD.estimated_premium OR
       NEW.partner_id IS DISTINCT FROM OLD.partner_id THEN
      RAISE EXCEPTION 'Accès refusé : Impossible de modifier les données sensibles du lead (statut, commission).';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_lead_secure_data ON public.leads;
CREATE TRIGGER on_lead_secure_data
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE PROCEDURE public.secure_lead_data();

-- 3. Sécurisation de la table `invitations`
-- Supprimer la lecture publique
DROP POLICY IF EXISTS "Lecture publique d'un token" ON public.invitations;

-- Fonction RPC pour vérifier une invitation en toute sécurité (sans exposer la table)
CREATE OR REPLACE FUNCTION public.verify_invitation(p_token uuid)
RETURNS jsonb AS $$
DECLARE
  v_invitation record;
BEGIN
  SELECT id, email, token, used_at, expires_at 
  INTO v_invitation
  FROM public.invitations 
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN row_to_json(v_invitation)::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assurer que le rôle anonyme et authentifié peuvent appeler cette fonction
GRANT EXECUTE ON FUNCTION public.verify_invitation(uuid) TO anon, authenticated;
