import React, { useState } from 'react';
import { CogIcon, KeyIcon, ShieldCheckIcon, BellIcon } from '@heroicons/react/24/outline';
import { UserRole, AdminData } from '../types';
import Toast from '../components/UI/Toast';
import Modal from '../components/UI/Modal';
import { addAuditLog, simulateApiDelay } from '../utils/mockData';

interface SettingsProps {
  currentRole: UserRole;
  adminData: AdminData;
  setAdminData: React.Dispatch<React.SetStateAction<AdminData>>;
}

const Settings: React.FC<SettingsProps> = ({ currentRole, adminData, setAdminData }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [settings, setSettings] = useState({
    metadataRetentionDays: 90,
    messageRetentionDays: 30,
    auditLogRetentionDays: 365,
    enableAutoBroadcast: true,
    enableIncidentNotifications: true,
    maxFailedLogins: 3,
    sessionTimeoutMinutes: 30,
    enableMFA: true,
    autoQuarantineRootedDevices: true
  });
  const [toast, setToast] = useState<{message: string; type: 'success' | 'warning' | 'error'; visible: boolean}>({
    message: '', type: 'success', visible: false
  });

  const handleSettingChange = async (setting: string, value: any) => {
    setIsLoading(true);
    await simulateApiDelay(300);

    const updatedSettings = { ...settings, [setting]: value };
    setSettings(updatedSettings);

    // Add audit log entry
    const updatedData = addAuditLog(adminData, {
      actor: `${currentRole}:Current User`,
      action: 'Setting Updated',
      target: setting,
      details: `Setting "${setting}" changed to "${value}"`,
      severity: 'Info'
    });

    setAdminData(updatedData);
    setIsLoading(false);
    setToast({
      message: 'Setting updated successfully',
      type: 'success',
      visible: true
    });
  };

  const handleEmergencyBroadcast = async (message: string, priority: 'high' | 'critical') => {
    setIsLoading(true);
    await simulateApiDelay(800);

    const updatedData = addAuditLog(adminData, {
      actor: `${currentRole}:Current User`,
      action: 'Emergency Broadcast Sent',
      target: 'All Users',
      details: `Emergency broadcast sent with ${priority} priority: "${message}"`,
      severity: priority === 'critical' ? 'Critical' : 'Warning'
    });

    setAdminData(updatedData);
    setIsLoading(false);
    setShowBroadcastModal(false);
    setToast({
      message: 'Emergency broadcast sent successfully',
      type: 'success',
      visible: true
    });
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'retention', name: 'Data Retention', icon: KeyIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ];

  if (currentRole !== 'Super Admin') {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <ShieldCheckIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Access Restricted</h2>
        <p className="text-slate-600 mt-2">Settings page is only accessible to Super Admin users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Emergency Broadcast
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Critical System Settings
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Changes to these settings affect the entire SUCHAK platform. All modifications are logged and require Super Admin privileges.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-lg border border-slate-200 p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">General Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Enable Auto-Broadcast</label>
                      <p className="text-sm text-slate-500">Automatically send system notifications to users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableAutoBroadcast}
                      onChange={(e) => handleSettingChange('enableAutoBroadcast', e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Session Timeout (minutes)</label>
                      <p className="text-sm text-slate-500">Automatic logout after inactivity</p>
                    </div>
                    <select
                      value={settings.sessionTimeoutMinutes}
                      onChange={(e) => handleSettingChange('sessionTimeoutMinutes', parseInt(e.target.value))}
                      className="border border-slate-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">Security Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Enable Multi-Factor Authentication</label>
                      <p className="text-sm text-slate-500">Require MFA for all user logins</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableMFA}
                      onChange={(e) => handleSettingChange('enableMFA', e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Max Failed Login Attempts</label>
                      <p className="text-sm text-slate-500">Account lockout after failed attempts</p>
                    </div>
                    <select
                      value={settings.maxFailedLogins}
                      onChange={(e) => handleSettingChange('maxFailedLogins', parseInt(e.target.value))}
                      className="border border-slate-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value={3}>3 attempts</option>
                      <option value={5}>5 attempts</option>
                      <option value={10}>10 attempts</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Auto-Quarantine Rooted Devices</label>
                      <p className="text-sm text-slate-500">Automatically quarantine compromised devices</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoQuarantineRootedDevices}
                      onChange={(e) => handleSettingChange('autoQuarantineRootedDevices', e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-medium text-slate-900 mb-4">Security Keys & Certificates</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">HSM Root Certificate</p>
                          <p className="text-sm text-slate-600">Valid until: Dec 31, 2025</p>
                        </div>
                        <button className="text-amber-600 hover:text-amber-800 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">Device Attestation Key</p>
                          <p className="text-sm text-slate-600">Last rotated: Jan 1, 2025</p>
                        </div>
                        <button className="text-amber-600 hover:text-amber-800 text-sm font-medium">
                          Rotate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'retention' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">Data Retention Policies</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Metadata Retention (days)
                    </label>
                    <input
                      type="number"
                      value={settings.metadataRetentionDays}
                      onChange={(e) => handleSettingChange('metadataRetentionDays', parseInt(e.target.value))}
                      min="1"
                      max="3650"
                      className="border border-slate-300 rounded-md px-3 py-2 w-32"
                    />
                    <p className="text-sm text-slate-500 mt-1">User metadata and system logs</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message Retention (days)
                    </label>
                    <input
                      type="number"
                      value={settings.messageRetentionDays}
                      onChange={(e) => handleSettingChange('messageRetentionDays', parseInt(e.target.value))}
                      min="1"
                      max="365"
                      className="border border-slate-300 rounded-md px-3 py-2 w-32"
                    />
                    <p className="text-sm text-slate-500 mt-1">Chat messages and media files</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Audit Log Retention (days)
                    </label>
                    <input
                      type="number"
                      value={settings.auditLogRetentionDays}
                      onChange={(e) => handleSettingChange('auditLogRetentionDays', parseInt(e.target.value))}
                      min="90"
                      max="7300"
                      className="border border-slate-300 rounded-md px-3 py-2 w-32"
                    />
                    <p className="text-sm text-slate-500 mt-1">Security audit logs and admin actions</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Compliance Notice</h4>
                  <p className="text-sm text-blue-700">
                    Data retention policies must comply with defense regulations. Audit logs are required to be retained for a minimum of 90 days.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Enable Incident Notifications</label>
                      <p className="text-sm text-slate-500">Alert admins of new security incidents</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableIncidentNotifications}
                      onChange={(e) => handleSettingChange('enableIncidentNotifications', e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-medium text-slate-900 mb-4">Mock Integrations</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">SIEM Integration</p>
                        <p className="text-sm text-slate-600">Connect to Security Information and Event Management</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Connected</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">SMS Gateway</p>
                        <p className="text-sm text-slate-600">Emergency notifications via SMS</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Pending</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Email Service</p>
                        <p className="text-sm text-slate-600">Admin notification emails</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex justify-end">
                <button
                  disabled={isLoading}
                  className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Broadcast Modal */}
      <Modal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        title="Emergency Broadcast"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleEmergencyBroadcast(
            formData.get('message') as string,
            formData.get('priority') as 'high' | 'critical'
          );
        }}>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">
                Emergency broadcasts are sent immediately to all active users. Use this feature only for critical security alerts or system emergencies.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
              <textarea
                name="message"
                required
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter emergency message..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority Level</label>
              <select
                name="priority"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="high">High Priority</option>
                <option value="critical">Critical - Override Do Not Disturb</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        </form>
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

export default Settings;