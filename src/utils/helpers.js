/**
 * Format a date string to a French-style readable format
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date to relative time (e.g., "il y a 2 jours")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  return formatDate(dateStr);
}

/**
 * Format currency (EUR)
 */
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with French formatting
 */
export function formatNumber(value) {
  if (value == null) return '0';
  return new Intl.NumberFormat('fr-FR').format(value);
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return 'lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

/**
 * Get status CSS class
 */
export function getStatusClass(status) {
  const map = {
    'NOUVEAU': 'status-nouveau',
    'CONTACTE': 'status-contacte',
    'FAUX NUMERO': 'status-perdu',
    'QUALIFIE': 'status-qualifie',
    'CONVERTI ET PAYE': 'status-converti',
  };
  return map[status] || 'status-nouveau';
}

/**
 * Export leads to CSV
 */
export function exportToCSV(leads, filename = 'leads_export.csv') {
  const headers = [
    'Contact', 'Email', 'Téléphone', 'Produit', 'Situation',
    'Source', 'Prime estimée', 'Statut', 'Commission (%)', 'Commission (€)',
    'Notes', 'Date création',
  ];

  const rows = leads.map(lead => [
    lead.contactName,
    lead.email,
    lead.phone,
    lead.productType,
    lead.situation,
    lead.source,
    lead.estimatedPremium,
    lead.status,
    lead.commissionRate,
    lead.commissionAmount,
    `"${(lead.notes || '').replace(/"/g, '""')}"`,
    formatDate(lead.createdAt),
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Calculate commission stats for a set of leads
 */
export function calcCommissionStats(leads) {
  const converted = leads.filter(l => l.status === 'CONVERTI ET PAYE');
  const totalEarned = converted.reduce((sum, l) => sum + (l.commissionAmount || 0), 0);
  
  const now = new Date();
  const thisMonth = converted.filter(l => {
    const d = new Date(l.updatedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthEarned = thisMonth.reduce((sum, l) => sum + (l.commissionAmount || 0), 0);
  
  const pending = leads.filter(l => !['CONVERTI ET PAYE', 'PERDU', 'FAUX NUMERO'].includes(l.status));
  const pendingEstimate = pending.reduce((sum, l) => {
    return sum + ((l.estimatedPremium || 0) * (l.commissionRate || 0) / 100);
  }, 0);

  const conversionTimes = converted
    .map(l => new Date(l.updatedAt) - new Date(l.createdAt))
    .filter(t => t > 0);
  const avgConversionTimeDays = conversionTimes.length > 0
    ? Math.round(conversionTimes.reduce((sum, t) => sum + t, 0) / conversionTimes.length / 86400000)
    : 0;

  const averageCart = converted.length > 0 ? totalEarned / converted.length : 0;

  return {
    totalEarned,
    thisMonthEarned,
    pendingEstimate,
    convertedCount: converted.length,
    conversionRate: leads.length > 0
      ? Math.round((converted.length / leads.length) * 100)
      : 0,
    avgConversionTimeDays,
    averageCart,
  };
}

/**
 * Calculate per-partner statistics for the Admin Leaderboard
 */
export function getPartnerLeaderboard(leads, partners) {
  if (!partners || partners.length === 0) return [];
  
  const partnerStats = partners.filter(p => p.role === 'partner').map(p => {
    const partnerLeads = leads.filter(l => l.partnerId === p.id);
    const stats = calcCommissionStats(partnerLeads);
    return {
      ...p,
      stats,
      leadCount: partnerLeads.length,
    };
  });

  return partnerStats.sort((a, b) => b.stats.convertedCount - a.stats.convertedCount);
}
