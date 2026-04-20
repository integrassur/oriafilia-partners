import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { useLeads } from '../context/LeadContext';
import { Upload } from 'lucide-react';

export default function CsvImportBtn({ className }) {
  const { addLead } = useLeads();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const leadsToImport = results.data;
          let imported = 0;
          for (const row of leadsToImport) {
            const contact = row['Contact'] || row['Nom'];
            if (!contact) continue; // Skip invalid row

            const leadData = {
              contactName: contact,
              email: row['Email'] || '',
              phone: row['Téléphone'] || row['Phone'] || '',
              productType: row['Produit'] || row['Product'] || 'Autre',
              situation: row['Situation'] || '',
              source: row['Source'] || 'CSV Import',
              estimatedPremium: parseFloat(row['Prime estimée']) || parseFloat(row['Premium']) || 0,
              commissionRate: parseFloat(row['Commission (%)']) || 10,
              notes: row['Notes'] || '',
            };
            await addLead(leadData);
            imported++;
          }
          alert(`${imported} leads importés avec succès !`);
        } catch (error) {
          console.error("Erreur lors de l'import :", error);
          alert("Une erreur s'est produite lors de l'import. Consultez la console.");
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        setLoading(false);
        console.error("Erreur PapaParse:", error);
        alert("Fichier CSV invalide.");
      }
    });
  };

  return (
    <>
      <input 
        type="file" 
        accept=".csv" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleFileUpload}
      />
      <button 
        className={className || "btn btn-secondary"} 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        <Upload size={18} />
        {loading ? 'Importation...' : 'Importer CSV'}
      </button>
    </>
  );
}
