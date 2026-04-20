import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { useLeads } from '../context/LeadContext';
import { UploadCloud, CheckCircle, FileText, AlertCircle, Download, Infinity as InfinityIcon } from 'lucide-react';

export default function CsvImportBtn({ className }) {
  const { addLead } = useLeads();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState(null); // { success: true/false, count: number, message: string }

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    
    // Quick validation
    if (!file.name.endsWith('.csv')) {
       setImportResult({ success: false, message: "Le fichier doit être au format .csv" });
       return;
    }

    setLoading(true);
    setImportResult(null);

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
          setImportResult({ success: true, count: imported, message: "Leads importés avec succès." });
        } catch (error) {
          console.error("Erreur lors de l'import :", error);
          setImportResult({ success: false, message: "Une erreur est survenue lors de l'enregistrement." });
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setLoading(false);
        console.error("Erreur PapaParse:", error);
        setImportResult({ success: false, message: "Le fichier CSV est corrompu ou mal formaté." });
      }
    });
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (e) => {
    processFile(e.target.files[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = (e) => {
      e.stopPropagation();
      const csvContent = "Contact,Email,Téléphone,Produit,Situation,Source,Prime estimée,Commission (%),Notes\nDupont Jean,jean@exemple.com,0600000000,Auto,Résilié,Site web,500,10,Option protection juridique";
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'modele_import_leads.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (importResult?.success) {
      return (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--color-green-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(16,194,126,0.3)' }} className="animate-slide-up">
              <CheckCircle size={64} style={{ color: 'var(--color-green)', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '12px' }}>Importation Réussie !</h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                  <strong>{importResult.count}</strong> prospects ont été ajoutés à votre pipeline.
              </p>
              <button className="btn btn-primary" onClick={() => setImportResult(null)}>
                  <InfinityIcon size={18} /> Importer un autre fichier
              </button>
          </div>
      );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Explications CSV */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px' }}>
         <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '1.1rem', color: 'var(--color-text)' }}>
            <FileText size={18} style={{ color: '#0ea5e9' }} /> Format requis
         </h4>
         <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
            Votre fichier doit comporter une en-tête avec au moins l'une des colonnes suivantes : 
            <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', margin: '0 4px', color: '#38bdf8' }}>Contact</code> ou 
            <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', margin: '0 4px', color: '#38bdf8' }}>Nom</code>.
         </p>
         <button className="btn btn-sm btn-outline" onClick={downloadTemplate} style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
             <Download size={16} /> Télécharger un modèle CSV
         </button>
      </div>

      {importResult && !importResult.success && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} /> {importResult.message}
          </div>
      )}

      <input 
        type="file" 
        accept=".csv" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleFileUpload}
      />
      
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        style={{
            border: `2px dashed ${dragActive ? 'var(--color-green)' : 'var(--color-border)'}`,
            background: dragActive ? 'var(--color-green-bg)' : 'rgba(0,0,0,0.1)',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 40px',
            textAlign: 'center',
            cursor: loading ? 'wait' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
        }}
      >
        <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: dragActive ? 'rgba(16,194,126,0.2)' : 'var(--color-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s ease'
        }}>
            <UploadCloud size={40} style={{ color: dragActive ? 'var(--color-green)' : 'var(--color-text-muted)' }} />
        </div>
        
        <div>
            <h3 style={{ fontSize: '1.25rem', color: dragActive ? 'var(--color-green)' : 'var(--color-text)', marginBottom: '8px' }}>
                {loading ? 'Traitement en cours...' : 'Glissez-déposez votre CSV ici'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Ou cliquez pour parcourir vos fichiers (Max 5MB)
            </p>
        </div>
      </div>
    </div>
  );
}
