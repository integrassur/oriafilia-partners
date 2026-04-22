/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from './AuthContext';

const LeadContext = createContext(null);

// ── Status mapping DB ↔ Frontend ──────────────────────────────
const DB_TO_FRONTEND_STATUS = {
  'nouveau':      'NOUVEAU',
  'contacte':     'CONTACTE',
  'faux_numero':  'FAUX NUMERO',
  'qualifie':     'QUALIFIE',
  'gagne':        'CONVERTI ET PAYE',
  'paye':         'CONVERTI ET PAYE',
  'perdu':        'PERDU',
};

// Reverse mapping – force 'CONVERTI ET PAYE' → 'gagne' (value accepted by CHECK constraint)
const FRONTEND_TO_DB_STATUS = {
  'NOUVEAU':          'nouveau',
  'CONTACTE':         'contacte',
  'FAUX NUMERO':      'faux_numero',
  'QUALIFIE':         'qualifie',
  'CONVERTI ET PAYE': 'gagne',
  'PERDU':            'perdu',
};

// ── Data mapping helpers ──────────────────────────────────────
const mapFromDb = (dbLead) => ({
  id: dbLead.id,
  contactName: dbLead.contact_name,
  email: dbLead.email,
  phone: dbLead.phone,
  productType: dbLead.product_type,
  situation: dbLead.situation,
  source: dbLead.source,
  estimatedPremium: Number(dbLead.estimated_premium) || 0,
  commissionRate: Number(dbLead.commission_rate) || 0,
  commissionAmount: Number(dbLead.commission) || 0,
  partnerId: dbLead.partner_id,
  status: DB_TO_FRONTEND_STATUS[dbLead.status] || 'NOUVEAU',
  notes: dbLead.notes,
  createdAt: dbLead.created_at,
  updatedAt: dbLead.updated_at,
});

const mapToDb = (lead) => {
  const db = {};
  if (lead.contactName !== undefined) db.contact_name = lead.contactName;
  if (lead.email !== undefined) db.email = lead.email;
  if (lead.phone !== undefined) db.phone = lead.phone;
  if (lead.productType !== undefined) db.product_type = lead.productType;
  if (lead.situation !== undefined) db.situation = lead.situation;
  if (lead.source !== undefined) db.source = lead.source;
  if (lead.estimatedPremium !== undefined) db.estimated_premium = lead.estimatedPremium;
  if (lead.commissionRate !== undefined) db.commission_rate = lead.commissionRate;
  if (lead.commissionAmount !== undefined) db.commission = lead.commissionAmount;
  if (lead.notes !== undefined) db.notes = lead.notes;
  if (lead.partnerId !== undefined) db.partner_id = lead.partnerId;

  if (lead.status !== undefined) {
    db.status = FRONTEND_TO_DB_STATUS[lead.status] || 'nouveau';
  }

  return db;
};

// ── Provider ──────────────────────────────────────────────────
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

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const leads = useMemo(() => {
    if (user?.role === 'admin' && adminPartnerFilter) {
      return allLeads.filter(l => l.partnerId === adminPartnerFilter);
    }
    return allLeads;
  }, [allLeads, user, adminPartnerFilter]);

  const addLead = async (leadData) => {
    if (!user) return;
    try {
      const dbLead = mapToDb({ ...leadData, status: 'NOUVEAU' });
      dbLead.partner_id = user.id;

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
        status: FRONTEND_TO_DB_STATUS[newStatus] || 'nouveau',
      };

      if (newStatus === 'CONVERTI ET PAYE' && commissionAmount !== null) {
        updates.commission = commissionAmount;
      }
      if (newStatus !== 'CONVERTI ET PAYE') {
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
