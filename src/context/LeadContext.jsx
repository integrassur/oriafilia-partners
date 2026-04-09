import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { SEED_LEADS } from '../utils/seedData';
import { generateId } from '../utils/helpers';
import { useAuth } from './AuthContext';

const LeadContext = createContext(null);

const STORAGE_KEY = 'integra_leads';

function getStoredLeads() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  // First load: use seed data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LEADS));
  return SEED_LEADS;
}

export function LeadProvider({ children }) {
  const [allLeads, setAllLeads] = useState(getStoredLeads);
  const [adminPartnerFilter, setAdminPartnerFilter] = useState('');
  const { user } = useAuth();

  // Persist to localStorage on every change
  const persistLeads = useCallback((updatedLeads) => {
    setAllLeads(updatedLeads);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
  }, []);

  // Get leads according to user role and admin filter
  const leads = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Administrateur') {
      if (adminPartnerFilter) {
        return allLeads.filter(l => l.partnerId === adminPartnerFilter);
      }
      return allLeads;
    }
    return allLeads.filter(l => l.partnerId === user.id);
  }, [allLeads, user, adminPartnerFilter]);

  // Add a new lead
  const addLead = useCallback((leadData) => {
    if (!user) return;
    const newLead = {
      ...leadData,
      id: generateId(),
      partnerId: user.id,
      status: 'Nouveau',
      commissionAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newLead, ...allLeads];
    persistLeads(updated);
    return newLead;
  }, [user, allLeads, persistLeads]);

  // Update lead status (and commission if converting)
  const updateLeadStatus = useCallback((leadId, newStatus, commissionAmount = null) => {
    const updated = allLeads.map(lead => {
      if (lead.id === leadId) {
        const updates = {
          ...lead,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        if (newStatus === 'Converti' && commissionAmount !== null) {
          updates.commissionAmount = commissionAmount;
        } else if (newStatus === 'Converti' && lead.estimatedPremium && lead.commissionRate) {
          updates.commissionAmount = Math.round(lead.estimatedPremium * lead.commissionRate / 100);
        }
        if (newStatus !== 'Converti') {
          updates.commissionAmount = 0;
        }
        return updates;
      }
      return lead;
    });
    persistLeads(updated);
  }, [allLeads, persistLeads]);

  // Update a full lead record
  const updateLead = useCallback((leadId, updates) => {
    const updated = allLeads.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, ...updates, updatedAt: new Date().toISOString() };
      }
      return lead;
    });
    persistLeads(updated);
  }, [allLeads, persistLeads]);

  // Delete a lead
  const deleteLead = useCallback((leadId) => {
    const updated = allLeads.filter(l => l.id !== leadId);
    persistLeads(updated);
  }, [allLeads, persistLeads]);

  return (
    <LeadContext.Provider value={{ 
      leads, 
      allLeads, 
      addLead, 
      updateLeadStatus, 
      updateLead, 
      deleteLead,
      adminPartnerFilter,
      setAdminPartnerFilter
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
