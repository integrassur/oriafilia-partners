import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState('loading'); // loading | valid | used | expired | success | error
  const [invitation, setInvitation] = useState(null);
  const [form, setForm] = useState({ full_name: '', password: '', confirm: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkToken() {
      const { data, error } = await supabase
        .rpc('verify_invitation', { p_token: token });

      if (error || !data) { setStep('expired'); return; }
      if (data.used_at) { setStep('used'); return; }
      if (new Date(data.expires_at) < new Date()) { setStep('expired'); return; }

      setInvitation(data);
      setStep('valid');
    }
    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.full_name.trim()) { setFormError('Veuillez entrer votre nom complet.'); return; }
    if (form.password.length < 8) { setFormError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (form.password !== form.confirm) { setFormError('Les mots de passe ne correspondent pas.'); return; }

    setSubmitting(true);
    try {
      // 1. Créer le compte Supabase Auth (email vient de l'invitation)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: form.password,
        options: {
          data: { full_name: form.full_name.trim() }
        }
      });

      if (signUpError) throw signUpError;

      // 2. Mettre à jour le profil avec le nom complet (le trigger crée le profil de base)
      const userId = signUpData.user?.id;
      if (userId) {
        // Attendre un court instant pour que le trigger s'exécute
        await new Promise(r => setTimeout(r, 500));
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: form.full_name.trim() })
          .eq('id', userId);
        
        if (profileError) console.warn('Profile update warning:', profileError.message);
      }

      // 3. Marquer l'invitation comme utilisée
      await supabase
        .from('invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

      setStep('success');
    } catch (err) {
      setFormError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const screenStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg)',
    padding: '24px'
  };

  const cardStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '460px',
    width: '100%',
    textAlign: 'center'
  };

  if (step === 'loading') return (
    <div style={screenStyle}>
      <div style={cardStyle}>
        <Loader size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Vérification de votre invitation...</p>
      </div>
    </div>
  );

  if (step === 'used') return (
    <div style={screenStyle}>
      <div style={cardStyle}>
        <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#f59e0b' }} />
        <h2 style={{ marginBottom: '12px' }}>Lien déjà utilisé</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Ce lien d'invitation a déjà été utilisé pour créer un compte.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Se connecter</button>
      </div>
    </div>
  );

  if (step === 'expired') return (
    <div style={screenStyle}>
      <div style={cardStyle}>
        <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#ef4444' }} />
        <h2 style={{ marginBottom: '12px' }}>Lien invalide ou expiré</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Ce lien d'invitation est invalide ou a expiré (validité 7 jours). Contactez votre administrateur.</p>
      </div>
    </div>
  );

  if (step === 'success') return (
    <div style={screenStyle}>
      <div style={cardStyle}>
        <CheckCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--color-green)' }} />
        <h2 style={{ marginBottom: '12px' }}>Compte créé avec succès !</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Bienvenue sur ORIAFFILIA.
        </p>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Connectez-vous avec votre adresse e-mail <strong>{invitation?.email}</strong> et le mot de passe que vous venez de choisir.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Se connecter</button>
      </div>
    </div>
  );

  // Formulaire d'inscription
  return (
    <div style={screenStyle}>
      <div style={{ ...cardStyle, textAlign: 'left' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #10c27e, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '24px'
          }}>🤝</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Créer votre compte Partenaire</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Complétez les informations ci-dessous pour activer votre accès.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && (
            <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          {/* Email visible et verrouillé — c'est le login */}
          <div className="form-group">
            <label>Adresse e-mail (identifiant de connexion)</label>
            <input
              type="email"
              className="form-input"
              value={invitation?.email || ''}
              readOnly
              style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: 'var(--color-bg)' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
              Cet email est votre identifiant de connexion — il ne peut pas être modifié.
            </span>
          </div>

          <div className="form-group">
            <label>Votre nom complet *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex : Marc Touka"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Mot de passe *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 8 caractères"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Répétez votre mot de passe"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px', padding: '14px' }}>
            {submitting ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
