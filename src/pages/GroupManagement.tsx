import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, CheckIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { AdminData, UserRole, GroupType } from '../types';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Toast from '../components/UI/Toast';
import { addAuditLog, exportToCsv, simulateApiDelay } from '../utils/mockData';

interface GroupManagementProps {
  adminData: AdminData;
  setAdminData: React.Dispatch<React.SetStateAction<AdminData>>;
  currentRole: UserRole;
}

const GroupManagement: React.FC<GroupManagementProps> = ({ adminData, setAdminData, currentRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<GroupType | ''>('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'warning' | 'error'; visible: boolean}>({
    message: '', type: 'success', visible: false
  });

  const filteredGroups = adminData.groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.group_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || group.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleApproveJoinRequest = async (groupId: string, userId: string, approve: boolean) => {
    setIsLoading(true);
    await simulateApiDelay();

    const updatedGroups = adminData.groups.map(group => {
      if (group.group_id === groupId) {
        const updatedRequests = group.pending_requests.filter(req => req.user_id !== userId);
        return {
          ...group,
          pending_requests: updatedRequests,
          members: approve ? group.members + 1 : group.members
        };
      }
      return group;
    });

    let updatedData = addAuditLog({
      ...adminData,
      groups: updatedGroups
    }, {
      actor: `${currentRole}:Current User`,
      action: `Group Join Request ${approve ? 'Approved' : 'Rejected'}`,
      target: `${groupId}:${userId}`,
      details: `Join request ${approve ? 'approved' : 'rejected'} for user ${userId}`,
      severity: 'Info'
    });

    setAdminData(updatedData);
    setIsLoading(false);
    setToast({
      message: `Join request ${approve ? 'approved' : 'rejected'} successfully`,
      type: 'success',
      visible: true
    });
  };

  const handleCreateGroup = async (groupData: { name: string; type: GroupType; description: string }) => {
    setIsLoading(true);
    await simulateApiDelay();

    const newGroup = {
      group_id: `G${String(Date.now()).slice(-3)}`,
      name: groupData.name,
      type: groupData.type,
      members: 1, // Creator is the first member
      pending_requests: [],
      activity: 0,
      created_at: new Date().toISOString()
    };

    let updatedData = addAuditLog({
      ...adminData,
      groups: [newGroup, ...adminData.groups]
    }, {
      actor: `${currentRole}:Current User`,
      action: 'Group Created',
      target: newGroup.group_id,
      details: `New ${groupData.type} group "${groupData.name}" created`,
      severity: 'Info'
    });

    setAdminData(updatedData);
    setIsLoading(false);
    setShowCreateModal(false);
    setToast({
      message: 'Group created successfully',
      type: 'success',
      visible: true
    });
  };

  const group = selectedGroup ? adminData.groups.find(g => g.group_id === selectedGroup) : null;

  const getTypeBadgeVariant = (type: GroupType) => {
    switch (type) {
      case 'Operational': return 'danger';
      case 'Family': return 'success';
      case 'Veteran': return 'info';
      default: return 'default';
    }
  };

  const canPerformActions = currentRole === 'Super Admin' || currentRole === 'Group Admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Group Management</h1>
        <div className="flex space-x-3">
          {canPerformActions && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Group</span>
            </button>
          )}
          <button
            onClick={() => exportToCsv(filteredGroups, 'groups')}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            Export Groups
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Total Groups</p>
          <p className="text-2xl font-bold text-slate-900">{adminData.groups.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Operational</p>
          <p className="text-2xl font-bold text-red-600">
            {adminData.groups.filter(g => g.type === 'Operational').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Family</p>
          <p className="text-2xl font-bold text-green-600">
            {adminData.groups.filter(g => g.type === 'Family').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600">Pending Requests</p>
          <p className="text-2xl font-bold text-yellow-600">
            {adminData.groups.reduce((sum, g) => sum + g.pending_requests.length, 0)}
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
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as GroupType | '')}
              className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Operational">Operational</option>
              <option value="Family">Family</option>
              <option value="Veteran">Veteran</option>
            </select>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.group_id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>
              <Badge variant={getTypeBadgeVariant(group.type)}>
                {group.type}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Members:</span>
                <span className="font-medium text-slate-900">{group.members}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Pending Requests:</span>
                <span className={`font-medium ${group.pending_requests.length > 0 ? 'text-yellow-600' : 'text-slate-900'}`}>
                  {group.pending_requests.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Daily Activity:</span>
                <span className="font-medium text-slate-900">{group.activity} messages</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Created:</span>
                <span className="font-medium text-slate-900">{new Date(group.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedGroup(group.group_id);
                setShowGroupModal(true);
              }}
              className="w-full mt-4 bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
            >
              Manage Group
            </button>
          </div>
        ))}
      </div>

      {/* Group Detail Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Group Management"
        size="xl"
      >
        {group && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Group Name</label>
                <p className="mt-1 text-sm text-slate-900 font-semibold">{group.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Type</label>
                <div className="mt-1">
                  <Badge variant={getTypeBadgeVariant(group.type)}>
                    {group.type}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Members</label>
                <p className="mt-1 text-sm text-slate-900">{group.members}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Created</label>
                <p className="mt-1 text-sm text-slate-900">{new Date(group.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Pending Join Requests */}
            {group.pending_requests.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Pending Join Requests</h4>
                <div className="space-y-3">
                  {group.pending_requests.map((request) => (
                    <div key={request.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{request.user_name}</p>
                        <p className="text-sm text-slate-600">{request.reason}</p>
                        <p className="text-xs text-slate-500">
                          Requested: {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                      </div>
                      {canPerformActions && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveJoinRequest(group.group_id, request.user_id, true)}
                            disabled={isLoading}
                            className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApproveJoinRequest(group.group_id, request.user_id, false)}
                            disabled={isLoading}
                            className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            title="Reject"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group Permissions */}
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Group Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">Messages Allowed</span>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    disabled={!canPerformActions}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">File Sharing Allowed</span>
                  <input
                    type="checkbox"
                    defaultChecked={group.type !== 'Family'}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    disabled={!canPerformActions}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">Voice Calls Allowed</span>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    disabled={!canPerformActions}
                  />
                </div>
              </div>
            </div>

            {group.pending_requests.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No pending join requests for this group
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Group"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleCreateGroup({
            name: formData.get('name') as string,
            type: formData.get('type') as GroupType,
            description: formData.get('description') as string
          });
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Group Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter group name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Group Type</label>
              <select
                name="type"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="Operational">Operational</option>
                <option value="Family">Family</option>
                <option value="Veteran">Veteran</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter group description"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Group'}
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

export default GroupManagement;