import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ShieldExclamationIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { AdminData, UserRole, DeviceCompliance } from '../types';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Toast from '../components/UI/Toast';
import { addAuditLog, exportToCsv, simulateApiDelay } from '../utils/mockData';

interface DeviceManagementProps {
  adminData: AdminData;
  setAdminData: React.Dispatch<React.SetStateAction<AdminData>>;
  currentRole: UserRole;
}

const DeviceManagement: React.FC<DeviceManagementProps> = ({ adminData, setAdminData, currentRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [complianceFilter, setComplianceFilter] = useState<DeviceCompliance | ''>('');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showQuarantineModal, setShowQuarantineModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'warning' | 'error'; visible: boolean}>({
    message: '', type: 'success', visible: false
  });

  // Get devices with user information
  const devicesWithUsers = adminData.devices.map(device => {
    const user = adminData.users.find(u => u.id === device.user_id);
    return { ...device, user };
  });

  const filteredDevices = devicesWithUsers.filter(device => {
    const matchesSearch = device.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompliance = !complianceFilter || device.compliance === complianceFilter;
    return matchesSearch && matchesCompliance;
  });

  const handleQuarantineDevice = async (deviceId: string) => {
    setIsLoading(true);
    await simulateApiDelay();

    const updatedDevices = adminData.devices.map(device => {
      if (device.device_id === deviceId) {
        return { 
          ...device, 
          compliance: device.compliance === 'Compliant' ? 'Rooted' : 'Compliant' as DeviceCompliance
        };
      }
      return device;
    });

    // Create incident for quarantine action
    const newIncident = {
      id: `I${Date.now()}`,
      type: 'Device Action',
      severity: 'Warning' as const,
      timestamp: new Date().toISOString(),
      user_id: adminData.devices.find(d => d.device_id === deviceId)?.user_id || '',
      status: 'Open' as const,
      summary: 'Device quarantine status changed',
      description: `Device ${deviceId} quarantine status modified by admin`,
      assigned_to: null
    };

    let updatedData = {
      ...adminData,
      devices: updatedDevices,
      incidents: [newIncident, ...adminData.incidents]
    };

    updatedData = addAuditLog(updatedData, {
      actor: `${currentRole}:Current User`,
      action: 'Device Quarantine Toggle',
      target: deviceId,
      details: `Device compliance status changed`,
      severity: 'Warning'
    });

    setAdminData(updatedData);
    setIsLoading(false);
    setShowQuarantineModal(false);
    setToast({
      message: 'Device status updated successfully',
      type: 'success',
      visible: true
    });
  };

  const handleRerunAttestation = async (deviceId: string) => {
    setIsLoading(true);
    await simulateApiDelay(800);

    const updatedDevices = adminData.devices.map(device => {
      if (device.device_id === deviceId) {
        return {
          ...device,
          attested_at: new Date().toISOString(),
          safety_score: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 40) + 30
        };
      }
      return device;
    });

    let updatedData = addAuditLog({
      ...adminData,
      devices: updatedDevices
    }, {
      actor: 'System',
      action: 'Device Attestation Rerun',
      target: deviceId,
      details: 'Manual attestation rerun requested by admin',
      severity: 'Info'
    });

    setAdminData(updatedData);
    setIsLoading(false);
    setToast({
      message: 'Device attestation completed',
      type: 'success',
      visible: true
    });
  };

  const device = selectedDevice ? adminData.devices.find(d => d.device_id === selectedDevice) : null;
  const deviceUser = device ? adminData.users.find(u => u.id === device.user_id) : null;

  const getComplianceBadgeVariant = (compliance: DeviceCompliance) => {
    switch (compliance) {
      case 'Compliant': return 'success';
      case 'Rooted': return 'danger';
      case 'Unknown': return 'warning';
      default: return 'default';
    }
  };

  const canPerformActions = currentRole === 'Super Admin' || currentRole === 'Group Admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Device Management</h1>
        {canPerformActions && (
          <button
            onClick={() => exportToCsv(filteredDevices, 'devices')}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            Export Devices
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Total Devices</p>
          <p className="text-2xl font-bold text-slate-900">{adminData.devices.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Compliant</p>
          <p className="text-2xl font-bold text-green-600">
            {adminData.devices.filter(d => d.compliance === 'Compliant').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Non-Compliant</p>
          <p className="text-2xl font-bold text-red-600">
            {adminData.devices.filter(d => d.compliance === 'Rooted').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Unknown</p>
          <p className="text-2xl font-bold text-yellow-600">
            {adminData.devices.filter(d => d.compliance === 'Unknown').length}
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
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value as DeviceCompliance | '')}
              className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Compliance</option>
              <option value="Compliant">Compliant</option>
              <option value="Rooted">Non-Compliant</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Device ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Model / OS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Compliance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Safety Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Attested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredDevices.map((device) => (
                <tr key={device.device_id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedDevice(device.device_id);
                        setShowDeviceModal(true);
                      }}
                      className="text-amber-600 hover:text-amber-800 font-medium text-sm"
                    >
                      {device.device_id}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {device.user?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {device.model} / {device.os}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getComplianceBadgeVariant(device.compliance)}>
                      {device.compliance}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        device.safety_score >= 80 ? 'bg-green-500' :
                        device.safety_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      {device.safety_score}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(device.attested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                    {device.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {canPerformActions && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedDevice(device.device_id);
                            setShowQuarantineModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Toggle Quarantine"
                        >
                          <ShieldExclamationIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRerunAttestation(device.device_id)}
                          disabled={isLoading}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Re-run Attestation"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Detail Modal */}
      <Modal
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
        title="Device Details"
        size="lg"
      >
        {device && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Device ID</label>
                <p className="mt-1 text-sm text-slate-900 font-mono">{device.device_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">User</label>
                <p className="mt-1 text-sm text-slate-900">{deviceUser?.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Model</label>
                <p className="mt-1 text-sm text-slate-900">{device.model}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Operating System</label>
                <p className="mt-1 text-sm text-slate-900">{device.os}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Compliance Status</label>
                <div className="mt-1">
                  <Badge variant={getComplianceBadgeVariant(device.compliance)}>
                    {device.compliance}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Safety Score</label>
                <p className="mt-1 text-sm text-slate-900">{device.safety_score}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last Attested</label>
                <p className="mt-1 text-sm text-slate-900">{new Date(device.attested_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">IP Address</label>
                <p className="mt-1 text-sm text-slate-900 font-mono">{device.ip}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Attestation Report</h4>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Root Detection:</span>
                    <span className={device.compliance === 'Compliant' ? 'text-green-600' : 'text-red-600'}>
                      {device.compliance === 'Compliant' ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>OS Integrity:</span>
                    <span className="text-green-600">Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encryption Status:</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VPN Connection:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {device.compliance !== 'Compliant' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="font-medium text-red-800 mb-2">Security Issues Detected</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Root access detected on device</li>
                  <li>• Unauthorized system modifications found</li>
                  <li>• Device may be compromised</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Quarantine Confirmation Modal */}
      <Modal
        isOpen={showQuarantineModal}
        onClose={() => setShowQuarantineModal(false)}
        title="Confirm Device Action"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to change the quarantine status of this device? This will affect the user's access to secure communications.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-yellow-800 text-sm">
              This action will be logged and may trigger security incidents for compliance tracking.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowQuarantineModal(false)}
              className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedDevice && handleQuarantineDevice(selectedDevice)}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Confirm Action'}
            </button>
          </div>
        </div>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
};

export default DeviceManagement;