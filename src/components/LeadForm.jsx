import { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import { PRODUCT_TYPES, SOURCES } from '../utils/seedData';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    addLead({
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
  };

  if (submitted) {
    return (
      <div className="form-card">
        <div className="success-screen">
          <div className="success-icon">
            <CheckCircle />
          </div>
          <h2>Lead soumis avec succès !</h2>
          <p>Votre lead a été enregistré et apparaît dans votre suivi.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => navigate('/leads')}>
              Voir mes leads
            </button>
            <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setForm({ contactName: '', email: '', phone: '', productType: '', situation: '', source: '', estimatedPremium: '', commissionRate: '', notes: '' }); }}>
              Nouveau lead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-form-container">
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="contactName">Nom du contact *</label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                className={`form-input ${errors.contactName ? 'error' : ''}`}
                placeholder="Jean Dupont"
                value={form.contactName}
                onChange={handleChange}
              />
              {errors.contactName && <span className="form-error">{errors.contactName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="jean@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="+33 6 12 34 56 78"
                value={form.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="productType">Produit d'assurance *</label>
              <select
                id="productType"
                name="productType"
                className={`form-select ${errors.productType ? 'error' : ''}`}
                value={form.productType}
                onChange={handleChange}
              >
                <option value="">Sélectionner...</option>
                {PRODUCT_TYPES.map(pt => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
              {errors.productType && <span className="form-error">{errors.productType}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="situation">Situation du client</label>
              <input
                id="situation"
                name="situation"
                type="text"
                className="form-input"
                placeholder="Ex: Résilié, jeune conducteur..."
                value={form.situation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="source">Source *</label>
              <select
                id="source"
                name="source"
                className={`form-select ${errors.source ? 'error' : ''}`}
                value={form.source}
                onChange={handleChange}
              >
                <option value="">Sélectionner...</option>
                {SOURCES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.source && <span className="form-error">{errors.source}</span>}
            </div>


            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                className="form-textarea"
                placeholder="Informations supplémentaires sur le lead..."
                value={form.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary btn-lg" id="submit-lead-btn">
              Soumettre le lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
