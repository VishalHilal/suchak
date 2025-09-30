import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, CheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import { AdminData, UserRole, IncidentSeverity, IncidentStatus } from '../types';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Toast from '../components/UI/Toast';
import { addAuditLog, exportToCsv, simulateApiDelay } from '../utils/mockData';

interface IncidentsProps {
  adminData: AdminData;
  setAdminData: React.Dispatch<React.SetStateAction<AdminData>>;
  currentRole: UserRole;
}

const Incidents: React.FC<IncidentsProps> = ({ adminData, setAdminData, currentRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | ''>('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('');
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'warning' | 'error'; visible: boolean}>({
    message: '', type: 'success', visible: false
  });

  const filteredIncidents = adminData.incidents.filter(incident => {
    const matchesSearch = incident.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = !severityFilter || incident.severity === severityFilter;
    const matchesStatus = !statusFilter || incident.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleIncidentAction = async (incidentId: string, action: 'acknowledge' | 'investigate' | 'resolve') => {
    setIsLoading(true);
    await simulateApiDelay();

    const updatedIncidents = adminData.incidents.map(incident => {
      if (incident.id === incidentId) {
        let newStatus: IncidentStatus = incident.status;
        if (action === 'acknowledge') newStatus = 'Investigating';
        if (action === 'investigate') newStatus = 'Investigating';
        if (action === 'resolve') newStatus = 'Resolved';
        
        return {
          ...incident,
          status: newStatus,
          assigned_to: action === 'resolve' ? incident.assigned_to : currentRole.includes('Admin') ? 'Current User' : incident.assigned_to
        };
      }
      return incident;
    });

    let updatedData = addAuditLog({
      ...adminData,
      incidents: updatedIncidents
    }, {
      actor: `${currentRole}:Current User`,
      action: `Incident ${action}d`,
      target: incidentId,
      details: `Incident ${action}d via admin console`,
      severity: 'Info'
    });

    setAdminData(updatedData);
    setIsLoading(false);
    setShowIncidentModal(false);
    setToast({
      message: `Incident ${action}d successfully`,
      type: 'success',
      visible: true
    });
  };

  const incident = selectedIncident ? adminData.incidents.find(i => i.id === selectedIncident) : null;
  const incidentUser = incident ? adminData.users.find(u => u.id === incident.user_id) : null;

  const getSeverityBadgeVariant = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical': return 'danger';
      case 'Warning': return 'warning';
      case 'Info': return 'info';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: IncidentStatus) => {
    switch (status) {
      case 'Open': return 'warning';
      case 'Investigating': return 'info';
      case 'Resolved': return 'success';
      default: return 'default';
    }
  };

  const canPerformActions = currentRole === 'Super Admin' || currentRole === 'Group Admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Incidents & Alerts</h1>
        <button
          onClick={() => exportToCsv(filteredIncidents, 'incidents')}
          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
        >
          Export Incidents
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Total Open</p>
          <p className="text-2xl font-bold text-slate-900">
            {adminData.incidents.filter(i => i.status === 'Open').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Critical</p>
          <p className="text-2xl font-bold text-red-600">
            {adminData.incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Investigating</p>
          <p className="text-2xl font-bold text-blue-600">
            {adminData.incidents.filter(i => i.status === 'Investigating').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Resolved</p>
          <p className="text-2xl font-bold text-green-600">
            {adminData.incidents.filter(i => i.status === 'Resolved').length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | '')}
              className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIncidents.map((incident) => (
          <div key={incident.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex space-x-2">
                <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                  {incident.severity}
                </Badge>
                <Badge variant={getStatusBadgeVariant(incident.status)}>
                  {incident.status}
                </Badge>
              </div>
              <span className="text-xs text-slate-500 font-mono">{incident.id}</span>
            </div>

            <h3 className="font-semibold text-slate-900 mb-2">{incident.summary}</h3>
            <p className="text-sm text-slate-600 mb-3">{incident.description}</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="text-slate-900">{incident.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Occurred:</span>
                <span className="text-slate-900">{new Date(incident.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned:</span>
                <span className="text-slate-900">{incident.assigned_to || 'Unassigned'}</span>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => {
                  setSelectedIncident(incident.id);
                  setShowIncidentModal(true);
                }}
                className="flex-1 bg-slate-100 text-slate-700 py-2 px-3 rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center space-x-1"
              >
                <EyeIcon className="h-4 w-4" />
                <span>View</span>
              </button>
              {canPerformActions && incident.status === 'Open' && (
                <button
                  onClick={() => handleIncidentAction(incident.id, 'acknowledge')}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>Acknowledge</span>
                </button>
              )}
              {canPerformActions && incident.status === 'Investigating' && (
                <button
                  onClick={() => handleIncidentAction(incident.id, 'resolve')}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>Resolve</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Incident Detail Modal */}
      <Modal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        title="Incident Details"
        size="lg"
      >
        {incident && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                {incident.severity}
              </Badge>
              <Badge variant={getStatusBadgeVariant(incident.status)}>
                {incident.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Incident ID</label>
                <p className="mt-1 text-sm text-slate-900 font-mono">{incident.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Type</label>
                <p className="mt-1 text-sm text-slate-900">{incident.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Occurred</label>
                <p className="mt-1 text-sm text-slate-900">{new Date(incident.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Assigned To</label>
                <p className="mt-1 text-sm text-slate-900">{incident.assigned_to || 'Unassigned'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Summary</label>
              <p className="mt-1 text-sm text-slate-900">{incident.summary}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <p className="mt-1 text-sm text-slate-900">{incident.description}</p>
            </div>

            {incidentUser && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Affected User</label>
                <div className="mt-1 p-3 bg-slate-50 rounded-md">
                  <p className="font-medium text-slate-900">{incidentUser.name}</p>
                  <p className="text-sm text-slate-600">{incidentUser.role} • {incidentUser.service_id}</p>
                  <p className="text-sm text-slate-600">{incidentUser.email}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Investigation Timeline</label>
              <div className="space-y-3">
                <div className="border-l-4 border-red-400 pl-4 py-2">
                  <p className="text-sm font-medium text-slate-900">Incident Created</p>
                  <p className="text-xs text-slate-600">{new Date(incident.timestamp).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">System automatically detected security event</p>
                </div>
                {incident.status !== 'Open' && (
                  <div className="border-l-4 border-blue-400 pl-4 py-2">
                    <p className="text-sm font-medium text-slate-900">Investigation Started</p>
                    <p className="text-xs text-slate-600">Assigned to security team for analysis</p>
                  </div>
                )}
                {incident.status === 'Resolved' && (
                  <div className="border-l-4 border-green-400 pl-4 py-2">
                    <p className="text-sm font-medium text-slate-900">Incident Resolved</p>
                    <p className="text-xs text-slate-600">Security measures implemented and verified</p>
                  </div>
                )}
              </div>
            </div>

            {canPerformActions && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                {incident.status === 'Open' && (
                  <button
                    onClick={() => handleIncidentAction(incident.id, 'acknowledge')}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Acknowledge & Investigate'}
                  </button>
                )}
                {incident.status === 'Investigating' && (
                  <button
                    onClick={() => handleIncidentAction(incident.id, 'resolve')}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Mark as Resolved'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {filteredIncidents.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No incidents found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default Incidents;