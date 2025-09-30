import { AdminData, AuditLog } from '../types';

export const loadMockData = async (): Promise<AdminData> => {
  try {
    const response = await fetch('/mock-data/admin_data.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load mock data:', error);
    throw error;
  }
};

export const addAuditLog = (data: AdminData, log: Omit<AuditLog, 'id' | 'timestamp'>): AdminData => {
  const newLog: AuditLog = {
    ...log,
    id: `A${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    audit_logs: [newLog, ...data.audit_logs],
  };
};

export const exportToCsv = (data: any[], filename: string) => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const simulateApiDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};