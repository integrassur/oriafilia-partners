import { useState } from 'react';
import LeadTable from '../components/LeadTable';
import LeadDetailModal from '../components/LeadDetailModal';

export default function TrackLeadsPage() {
  const [selectedLead, setSelectedLead] = useState(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Suivi des Leads</h1>
          <p>Recherchez, filtrez et suivez l'avancement de vos leads</p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-lg)' }}>
        <LeadTable onSelectLead={setSelectedLead} />
      </div>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
