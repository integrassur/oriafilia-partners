import { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import { PRODUCT_TYPES, SOURCES } from '../utils/seedData';
import { CheckCircle, User, Mail, Phone, Briefcase, Tag, FileText, Send, Hash } from 'lucide-react';

const InputWrapper = ({ icon: Icon, error, children }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: error ? '#ef4444' : 'var(--color-text-muted)', pointerEvents: 'none', display: 'flex' }}>
        {Icon && <Icon size={18} />}
    </div>
    <div className="input-with-icon">
        {children}
    </div>
  </div>
);

const DEFAULT_RATES = {
  'Auto': 10,
  'Moto': 10,
  'Habitation': 8,
  'Santé': 12,
  'Prévoyance': 12,
  'RC Pro': 15,
};

export default function LeadForm() {
  const { addLead } = useLeads();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    contactName: '',
    email: '',
    phone: '',
    productType: '',
    situation: '',
    source: '',
    estimatedPremium: '',
    commissionRate: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-set commission rate based on product type
      if (name === 'productType' && DEFAULT_RATES[value]) {
        updated.commissionRate = DEFAULT_RATES[value].toString();
      }
      return updated;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.contactName.trim()) errs.contactName = 'Nom requis';
    if (!form.email.trim()) errs.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide';
    if (!form.phone.trim()) errs.phone = 'Téléphone requis';
    if (!form.productType) errs.productType = 'Produit requis';
    if (!form.source) errs.source = 'Source requise';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addLead({
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        productType: form.productType,
        situation: form.situation.trim(),
        source: form.source,
        estimatedPremium: 0,
        commissionRate: DEFAULT_RATES[form.productType] || 10,
        notes: form.notes.trim(),
      });
      setSubmitted(true);
    } catch {
      alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-green-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(16,194,126,0.3)' }} className="animate-slide-up">
          <CheckCircle size={64} style={{ color: 'var(--color-green)', margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: '1.75rem', color: 'var(--color-text)', margin: '0 0 16px 0' }}>Lead soumis avec succès !</h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
              Ce prospect a été enregistré et apparaît désormais dans votre suivi de pipeline.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => { setSubmitted(false); setForm({ contactName: '', email: '', phone: '', productType: '', situation: '', source: '', estimatedPremium: '', commissionRate: '', notes: '' }); }}>
               Ajouter un autre lead
            </button>
          </div>
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Section Contact */}
      <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>Coordonnées du prospect</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label htmlFor="contactName">Nom et Prénom <span style={{color: '#ef4444'}}>*</span></label>
              <InputWrapper icon={User} error={errors.contactName}>
                  <input
                    id="contactName" name="contactName" type="text"
                    className={`form-input ${errors.contactName ? 'error' : ''}`}
                    style={{ width: '100%', paddingLeft: '42px' }}
                    placeholder="Jean Dupont"
                    value={form.contactName} onChange={handleChange}
                  />
              </InputWrapper>
              {errors.contactName && <span className="form-error">{errors.contactName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse Email <span style={{color: '#ef4444'}}>*</span></label>
              <InputWrapper icon={Mail} error={errors.email}>
                  <input
                    id="email" name="email" type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    style={{ width: '100%', paddingLeft: '42px' }}
                    placeholder="jean.dupont@exemple.com"
                    value={form.email} onChange={handleChange}
                  />
              </InputWrapper>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone <span style={{color: '#ef4444'}}>*</span></label>
              <InputWrapper icon={Phone} error={errors.phone}>
                  <input
                    id="phone" name="phone" type="tel"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    style={{ width: '100%', paddingLeft: '42px' }}
                    placeholder="06 12 34 56 78"
                    value={form.phone} onChange={handleChange}
                  />
              </InputWrapper>
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>
          </div>
      </div>

      {/* Section Besoin */}
      <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>Détails du besoin</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label htmlFor="productType">Produit ciblé <span style={{color: '#ef4444'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: errors.productType ? '#ef4444' : 'var(--color-text-muted)', pointerEvents: 'none', display: 'flex' }}>
                    <Briefcase size={18} />
                </div>
                <select
                    id="productType" name="productType"
                    className={`form-select ${errors.productType ? 'error' : ''}`}
                    style={{ width: '100%', paddingLeft: '42px' }}
                    value={form.productType} onChange={handleChange}
                >
                    <option value="">Sélectionner une catégorie...</option>
                    {PRODUCT_TYPES.map(pt => (
                    <option key={pt} value={pt}>{pt}</option>
                    ))}
                </select>
              </div>
              {errors.productType && <span className="form-error">{errors.productType}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="source">Canal d'acquisition <span style={{color: '#ef4444'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: errors.source ? '#ef4444' : 'var(--color-text-muted)', pointerEvents: 'none', display: 'flex' }}>
                    <Tag size={18} />
                </div>
                <select
                    id="source" name="source"
                    className={`form-select ${errors.source ? 'error' : ''}`}
                    style={{ width: '100%', paddingLeft: '42px' }}
                    value={form.source} onChange={handleChange}
                >
                    <option value="">Sélectionner une source...</option>
                    {SOURCES.map(s => (
                    <option key={s} value={s}>{s}</option>
                    ))}
                </select>
              </div>
              {errors.source && <span className="form-error">{errors.source}</span>}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="situation">Situation spécifique du client</label>
              <InputWrapper icon={FileText}>
                  <input
                    id="situation" name="situation" type="text"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '42px' }}
                    placeholder="Ex: Conducteur Novice, Multi-sinistres, Résilié..."
                    value={form.situation} onChange={handleChange}
                  />
              </InputWrapper>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="notes">Notes & Commentaires (Optionnel)</label>
              <textarea
                id="notes" name="notes"
                className="form-textarea"
                style={{ width: '100%', minHeight: '100px' }}
                placeholder="Renseignez toute information utile pour faciliter la conversion de ce lead..."
                value={form.notes} onChange={handleChange}
              />
            </div>
          </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button type="submit" className="btn btn-primary btn-lg" style={{ minWidth: '220px', fontSize: '1.05rem' }}>
          <Send size={20} style={{ marginRight: '10px' }} /> Envoyer à l'équipe
        </button>
      </div>
    </form>
  );
}
