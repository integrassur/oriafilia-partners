import LeadForm from '../components/LeadForm';
import CsvImportBtn from '../components/CsvImportBtn';

export default function SubmitLeadPage() {
  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Soumettre un Lead</h1>
          <p>Remplissez les informations manuellement ou importez un fichier CSV</p>
        </div>
        <div>
          <CsvImportBtn className="btn btn-primary" />
        </div>
      </div>
      <LeadForm />
    </div>
  );
}
