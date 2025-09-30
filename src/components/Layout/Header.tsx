import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { UserRole, AdminData } from '../../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  adminData: AdminData;
}

const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, onLogout, adminData }) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: UserRole[] = ['Super Admin', 'Group Admin', 'Auditor'];
  const criticalIncidents = adminData.incidents.filter(i => i.severity === 'Critical' && i.status === 'Open').length;

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-slate-900">Admin Dashboard</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <BellIcon className="h-6 w-6" />
            {criticalIncidents > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                {criticalIncidents}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-slate-200 z-50">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-medium text-slate-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {adminData.incidents
                  .filter(i => i.severity === 'Critical' && i.status === 'Open')
                  .slice(0, 5)
                  .map(incident => (
                    <div key={incident.id} className="p-3 border-b border-slate-100 hover:bg-slate-50">
                      <p className="font-medium text-sm text-slate-900">{incident.summary}</p>
                      <p className="text-xs text-slate-600 mt-1">{new Date(incident.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                {criticalIncidents === 0 && (
                  <div className="p-4 text-center text-slate-500">
                    No critical incidents
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            <span className="text-sm font-medium text-slate-700">{currentRole}</span>
            <ChevronDownIcon className="h-4 w-4 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-50">
              <div className="p-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleChange(role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      currentRole === role
                        ? 'bg-amber-100 text-amber-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-200 p-2">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;