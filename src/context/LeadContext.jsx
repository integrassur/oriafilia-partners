import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from './AuthContext';

const LeadContext = createContext(null);

// Fonction de mapping pour passer de la base de données (snake_case) au frontend (camelCase)
const mapFromDb = (dbLead) => ({
  id: dbLead.id,
  contactName: dbLead.contact_name,
  email: dbLead.email,
  phone: dbLead.phone,
  productType: dbLead.product_type,
  situation: dbLead.situation,
  source: dbLead.source,
  partnerId: dbLead.partner_id,
  status: dbLead.status === 'gagne' ? 'Converti' : 
          dbLead.status === 'en_cours' ? 'En cours' : 
          dbLead.status === 'nouveau' ? 'Nouveau' : 'Perdu',
  commissionAmount: Number(dbLead.commission),
  createdAt: dbLead.created_at,
  notes: dbLead.notes
});

const mapToDb = (lead) => {
  const db = {};
  if (lead.contactName !== undefined) db.contact_name = lead.contactName;
  if (lead.email !== undefined) db.email = lead.email;
  if (lead.phone !== undefined) db.phone = lead.phone;
  if (lead.productType !== undefined) db.product_type = lead.productType;
  if (lead.situation !== undefined) db.situation = lead.situation;
  if (lead.source !== undefined) db.source = lead.source;
  
  if (lead.status !== undefined) {
    db.status = lead.status === 'Converti' ? 'gagne' :
                lead.status === 'En cours' ? 'en_cours' :
                lead.status === 'Nouveau' ? 'nouveau' : 'perdu';
  }
  
  if (lead.commissionAmount !== undefined) db.commission = lead.commissionAmount;
  if (lead.notes !== undefined) db.notes = lead.notes;
  
  return db;
};

export function LeadProvider({ children }) {
  const [allLeads, setAllLeads] = useState([]);
  const [adminPartnerFilter, setAdminPartnerFilter] = useState('');
  const [loadingLeads, setLoadingLeads] = useState(true);
  const { user } = useAuth();

  const fetchLeads = useCallback(async () => {
    if (!user) {
      setAllLeads([]);
      setLoadingLeads(false);
      return;
    }

    try {
      // Grâce à RLS sur Supabase :
      // - Si c'est l'admin, ça renverra TOUS les leads.
      // - Si c'est un partenaire, ça ne renverra QUE ses leads.
      // On a donc plus besoin de filtrer manuellement par rapport au rôle ici.
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllLeads(data.map(mapFromDb));
    } catch (error) {
      console.error("Erreur de récupération des leads :", error);
    } finally {
      setLoadingLeads(false);
    }
  }, [user]);

  // Charger les leads quand l'utilisateur change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Côté frontend, on conserve juste le filtre visuel pour l'administrateur
  const leads = useMemo(() => {
    if (user?.role === 'admin' && adminPartnerFilter) {
      return allLeads.filter(l => l.partnerId === adminPartnerFilter);
    }
    return allLeads;
  }, [allLeads, user, adminPartnerFilter]);

  const addLead = async (leadData) => {
    if (!user) return;
    try {
      const dbLead = mapToDb({ ...leadData, status: 'Nouveau' });
      dbLead.partner_id = user.id; // Important

      const { data, error } = await supabase
        .from('leads')
        .insert([dbLead])
        .select()
        .single();

      if (error) {
        console.error("Erreur d'ajout de lead:", error);
        throw error;
      }
      
      const newFrontendLead = mapFromDb(data);
      setAllLeads(prev => [newFrontendLead, ...prev]);
      return newFrontendLead;
    } catch (error) {
      console.error('Erreur addLead:', error.message);
      throw error;
    }
  };

  const updateLeadStatus = async (leadId, newStatus, commissionAmount = null) => {
    try {
      const updates = {
        status: newStatus === 'Converti' ? 'gagne' :
                newStatus === 'En cours' ? 'en_cours' :
                newStatus === 'Nouveau' ? 'nouveau' : 'perdu'
      };

      if (newStatus === 'Converti' && commissionAmount !== null) {
        updates.commission = commissionAmount;
      }
      if (newStatus !== 'Converti') {
        updates.commission = 0;
      }

      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      const updatedFrontendLead = mapFromDb(data);
      setAllLeads(prev => prev.map(l => l.id === leadId ? updatedFrontendLead : l));
    } catch (error) {
      console.error("Erreur de mise à jour du statut :", error);
    }
  };

  const updateLead = async (leadId, updates) => {
    try {
      const dbUpdates = mapToDb(updates);
      // Supprimer les clés vides non renseignées dans updates s'il y en a
      Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);

      const { data, error } = await supabase
        .from('leads')
        .update(dbUpdates)
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      const updatedFrontendLead = mapFromDb(data);
      setAllLeads(prev => prev.map(l => l.id === leadId ? updatedFrontendLead : l));
    } catch (error) {
      console.error("Erreur de mise à jour du lead :", error);
    }
  };

  const deleteLead = async (leadId) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      setAllLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (error) {
      console.error("Erreur de suppression du lead :", error);
    }
  };

  return (
    <LeadContext.Provider value={{ 
      leads, 
      allLeads, 
      addLead, 
      updateLeadStatus, 
      updateLead, 
      deleteLead,
      adminPartnerFilter,
      setAdminPartnerFilter,
      loadingLeads
    }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error('useLeads must be used within LeadProvider');
  return ctx;
}
