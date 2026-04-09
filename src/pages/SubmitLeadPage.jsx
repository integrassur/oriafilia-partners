import LeadForm from '../components/LeadForm';

export default function SubmitLeadPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Soumettre un Lead</h1>
          <p>Remplissez les informations de votre nouveau prospect</p>
        </div>
      </div>
      <LeadForm />
    </div>
  );
}
