import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  DeviceTabletIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { UserRole } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentRole: UserRole;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['Super Admin', 'Group Admin', 'Auditor'] },
  { name: 'User Management', href: '/users', icon: UsersIcon, roles: ['Super Admin', 'Group Admin'] },
  { name: 'Device Management', href: '/devices', icon: DeviceTabletIcon, roles: ['Super Admin', 'Group Admin'] },
  { name: 'Group Management', href: '/groups', icon: UserGroupIcon, roles: ['Super Admin', 'Group Admin'] },
  { name: 'Audit Logs', href: '/audit', icon: DocumentTextIcon, roles: ['Super Admin', 'Auditor'] },
  { name: 'Incidents & Alerts', href: '/incidents', icon: ExclamationTriangleIcon, roles: ['Super Admin', 'Group Admin'] },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['Super Admin', 'Group Admin', 'Auditor'] },
  { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['Super Admin'] },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, currentRole }) => {
  const location = useLocation();

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(currentRole)
  );

  return (
    <div className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700 transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-8 w-8 text-amber-500" />
            <div>
              <h1 className="text-white font-bold text-lg">SUCHAK</h1>
              <p className="text-slate-400 text-xs">Admin Console</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`} />
                  {!collapsed && item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role indicator */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-800 rounded-md p-3">
            <p className="text-slate-400 text-xs">Current Role</p>
            <p className="text-white text-sm font-medium">{currentRole}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;