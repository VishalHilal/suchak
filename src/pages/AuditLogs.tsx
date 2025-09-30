import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { AdminData, IncidentSeverity } from '../types';
import Badge from '../components/UI/Badge';
import { exportToCsv } from '../utils/mockData';

interface AuditLogsProps {
  adminData: AdminData;
  setAdminData: React.Dispatch<React.SetStateAction<AdminData>>;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ adminData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | ''>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Get unique actors for filter
  const uniqueActors = [...new Set(adminData.audit_logs.map(log => log.actor))];

  const filteredLogs = adminData.audit_logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActor = !actorFilter || log.actor === actorFilter;
    const matchesSeverity = !severityFilter || log.severity === severityFilter;
    
    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const logDate = new Date(log.timestamp);
      if (dateRange.start) matchesDate = matchesDate && logDate >= new Date(dateRange.start);
      if (dateRange.end) matchesDate = matchesDate && logDate <= new Date(dateRange.end);
    }
    
    return matchesSearch && matchesActor && matchesSeverity && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const getSeverityBadgeVariant = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical': return 'danger';
      case 'Warning': return 'warning';
      case 'Info': return 'info';
      default: return 'default';
    }
  };

  const handleExport = () => {
    const exportData = filteredLogs.map(log => ({
      timestamp: new Date(log.timestamp).toLocaleString(),
      actor: log.actor,
      action: log.action,
      target: log.target,
      details: log.details,
      severity: log.severity
    }));
    exportToCsv(exportData, 'audit_logs');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <button
          onClick={handleExport}
          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors flex items-center space-x-2"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{adminData.audit_logs.length}</p>
            <p className="text-sm text-slate-600">Total Logs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {adminData.audit_logs.filter(log => log.severity === 'Critical').length}
            </p>
            <p className="text-sm text-slate-600">Critical Events</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {adminData.audit_logs.filter(log => log.severity === 'Warning').length}
            </p>
            <p className="text-sm text-slate-600">Warnings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {adminData.audit_logs.filter(log => log.severity === 'Info').length}
            </p>
            <p className="text-sm text-slate-600">Info Events</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">All Actors</option>
            {uniqueActors.map(actor => (
              <option key={actor} value={actor}>{actor}</option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as IncidentSeverity | '')}
            className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>

          <div className="flex space-x-2">
            <input
              type="date"
              placeholder="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent flex-1"
            />
            <input
              type="date"
              placeholder="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent flex-1"
            />
          </div>
        </div>

        {(searchTerm || actorFilter || severityFilter || dateRange.start || dateRange.end) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {filteredLogs.length} of {adminData.audit_logs.length} logs
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActorFilter('');
                setSeverityFilter('');
                setDateRange({ start: '', end: '' });
                setCurrentPage(1);
              }}
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.actor.includes('System') 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {log.actor}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                    <div className="truncate" title={log.details}>
                      {log.details}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getSeverityBadgeVariant(log.severity)}>
                      {log.severity}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-3 border border-slate-200 rounded-lg flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of{' '}
                <span className="font-medium">{filteredLogs.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {filteredLogs.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No audit logs found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;