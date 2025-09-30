import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AdminData, UserRole, UserStatus } from '../types';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Toast from '../components/UI/Toast';
import { addAuditLog, exportToCsv, simulateApiDelay } from '../utils/mockData';

interface UserManagementProps {
  adminData: AdminData;
  setAdminData: React.Dispatch<React.SetStateAction<AdminData>>;
  currentRole: UserRole;
}

const UserManagement: React.FC<UserManagementProps> = ({ adminData, setAdminData, currentRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'suspend' | 'activate'>('approve');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'warning' | 'error'; visible: boolean}>({
    message: '', type: 'success', visible: false
  });

  const filteredUsers = adminData.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.service_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUserAction = async (userId: string, action: 'approve' | 'suspend' | 'activate') => {
    setIsLoading(true);
    await simulateApiDelay();

    const updatedUsers = adminData.users.map(user => {
      if (user.id === userId) {
        let newStatus: UserStatus = user.status;
        if (action === 'approve') newStatus = 'Active';
        if (action === 'suspend') newStatus = 'Suspended';
        if (action === 'activate') newStatus = 'Active';
        return { ...user, status: newStatus };
      }
      return user;
    });

    const updatedData = addAuditLog({
      ...adminData,
      users: updatedUsers
    }, {
      actor: `${currentRole}:Current User`,
      action: `User ${action}d`,
      target: userId,
      details: `User ${action}d via admin console`,
      severity: 'Info'
    });

    setAdminData(updatedData);
    setIsLoading(false);
    setShowConfirmModal(false);
    setToast({
      message: `User successfully ${action}d`,
      type: 'success',
      visible: true
    });
  };

  const handleBulkAction = async (action: 'approve' | 'suspend') => {
    setIsLoading(true);
    await simulateApiDelay();

    const updatedUsers = adminData.users.map(user => {
      if (selectedUsers.includes(user.id)) {
        const newStatus: UserStatus = action === 'approve' ? 'Active' : 'Suspended';
        return { ...user, status: newStatus };
      }
      return user;
    });

    let updatedData = { ...adminData, users: updatedUsers };

    // Add audit log for bulk action
    updatedData = addAuditLog(updatedData, {
      actor: `${currentRole}:Current User`,
      action: `Bulk ${action}`,
      target: `${selectedUsers.length} users`,
      details: `Bulk ${action} operation on selected users`,
      severity: 'Info'
    });

    setAdminData(updatedData);
    setSelectedUsers([]);
    setIsLoading(false);
    setToast({
      message: `${selectedUsers.length} users ${action}d successfully`,
      type: 'success',
      visible: true
    });
  };

  const user = selectedUser ? adminData.users.find(u => u.id === selectedUser) : null;
  const userDevice = user?.device_id ? adminData.devices.find(d => d.device_id === user.device_id) : null;
  const userAuditLogs = adminData.audit_logs.filter(log => log.target === selectedUser).slice(0, 10);

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Suspended': return 'danger';
      default: return 'default';
    }
  };

  const canPerformActions = currentRole === 'Super Admin' || currentRole === 'Group Admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        {canPerformActions && (
          <button
            onClick={() => exportToCsv(filteredUsers, 'users')}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            Export Users
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Total Users</p>
          <p className="text-2xl font-bold text-slate-900">{adminData.users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{adminData.users.filter(u => u.status === 'Active').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{adminData.users.filter(u => u.status === 'Pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{adminData.users.filter(u => u.status === 'Suspended').length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
                className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {canPerformActions && selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">{selectedUsers.length} selected</span>
              <button
                onClick={() => handleBulkAction('approve')}
                disabled={isLoading}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                disabled={isLoading}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Suspend All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {canPerformActions && (
                  <th className="w-4 px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Groups</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  {canPerformActions && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedUser(user.id);
                        setShowUserModal(true);
                      }}
                      className="text-amber-600 hover:text-amber-800 font-medium"
                    >
                      {user.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.service_id}****</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.groups}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user.id);
                        setShowUserModal(true);
                      }}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {canPerformActions && user.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setSelectedUser(user.id);
                          setActionType('approve');
                          setShowConfirmModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    {canPerformActions && user.status === 'Active' && (
                      <button
                        onClick={() => {
                          setSelectedUser(user.id);
                          setActionType('suspend');
                          setShowConfirmModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                    {canPerformActions && user.status === 'Suspended' && (
                      <button
                        onClick={() => {
                          setSelectedUser(user.id);
                          setActionType('activate');
                          setShowConfirmModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
      >
        {user && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <p className="mt-1 text-sm text-slate-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <p className="mt-1 text-sm text-slate-900">{user.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Service ID</label>
                <p className="mt-1 text-sm text-slate-900">{user.service_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <p className="mt-1 text-sm text-slate-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <p className="mt-1 text-sm text-slate-900">{user.phone}</p>
              </div>
            </div>

            {userDevice && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Device Information</h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Model:</span> {userDevice.model}
                    </div>
                    <div>
                      <span className="font-medium">OS:</span> {userDevice.os}
                    </div>
                    <div>
                      <span className="font-medium">Compliance:</span> 
                      <Badge 
                        variant={userDevice.compliance === 'Compliant' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {userDevice.compliance}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Last Attested:</span> {new Date(userDevice.attested_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {userAuditLogs.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Recent Activity</h4>
                <div className="max-h-48 overflow-y-auto">
                  {userAuditLogs.map((log) => (
                    <div key={log.id} className="border-l-4 border-slate-200 pl-4 py-2">
                      <p className="text-sm font-medium text-slate-900">{log.action}</p>
                      <p className="text-xs text-slate-600">{log.details}</p>
                      <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={`Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)} User`}
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to {actionType} this user? This action will be logged for audit purposes.
          </p>
          {actionType === 'suspend' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">
                Suspending this user will immediately revoke their access to all systems and groups.
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedUser && handleUserAction(selectedUser, actionType)}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                actionType === 'suspend' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Processing...' : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} User`}
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

export default UserManagement;