import { useState } from 'react';
import LeadForm from '../components/LeadForm';
import CsvImportBtn from '../components/CsvImportBtn';
import { PenLine, FileUp } from 'lucide-react';

export default function SubmitLeadPage() {
  const [activeTab, setActiveTab] = useState('manual');

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Pipeline Center</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
          Choisissez la méthode d'intégration pour vos nouvelles opportunités.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', background: 'var(--color-surface)', padding: '6px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
          <button 
            className={`btn ${activeTab === 'manual' ? 'btn-primary' : ''}`}
            style={{ 
              borderRadius: '12px', 
              padding: '12px 32px', 
              color: activeTab === 'manual' ? '#fff' : 'var(--color-text-secondary)', 
              background: activeTab === 'manual' ? '' : 'transparent', 
              boxShadow: activeTab === 'manual' ? '' : 'none',
              fontSize: '1rem'
            }}
            onClick={() => setActiveTab('manual')}
          >
            <PenLine size={20} style={{ marginRight: '10px' }}/> Saisie 1-à-1
          </button>
          <button 
            className={`btn ${activeTab === 'csv' ? 'btn-primary' : ''}`}
            style={{ 
              borderRadius: '12px', 
              padding: '12px 32px', 
              color: activeTab === 'csv' ? '#fff' : 'var(--color-text-secondary)', 
              background: activeTab === 'csv' ? '' : 'transparent', 
              boxShadow: activeTab === 'csv' ? '' : 'none',
              fontSize: '1rem'
            }}
            onClick={() => setActiveTab('csv')}
          >
            <FileUp size={20} style={{ marginRight: '10px' }}/> Import Massif
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', borderTop: '4px solid var(--color-green)' }}>
        {activeTab === 'manual' ? (
          <div className="animate-fade-in" style={{ animationDuration: '0.3s' }}>
             <h2 style={{ fontSize: '1.5rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--color-green-bg)', borderRadius: '10px' }}>
                  <PenLine size={24} className="text-green" style={{ color: 'var(--color-green)' }} />
                </div>
                Nouvelle Opportunité
             </h2>
             <LeadForm />
          </div>
        ) : (
          <div className="animate-fade-in" style={{ animationDuration: '0.3s' }}>
             <h2 style={{ fontSize: '1.5rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--color-green-bg)', borderRadius: '10px' }}>
                  <FileUp size={24} className="text-green" style={{ color: 'var(--color-green)' }} />
                </div>
                Import de Base CSV
             </h2>
             <CsvImportBtn />
          </div>
        )}
      </div>
    </div>
  );
}
