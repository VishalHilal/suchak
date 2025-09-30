import React from 'react';
import { UsersIcon, UserPlusIcon, ExclamationTriangleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { AdminData } from '../types';
import Badge from '../components/UI/Badge';

interface DashboardProps {
  adminData: AdminData;
  setAdminData: React.Dispatch<React.SetStateAction<AdminData>>;
}

const Dashboard: React.FC<DashboardProps> = ({ adminData }) => {
  const { dashboard_stats } = adminData;

  const complianceData = [
    { name: 'Compliant', value: dashboard_stats.device_compliance.compliant, color: '#22c55e' },
    { name: 'Non-Compliant', value: dashboard_stats.device_compliance.non_compliant, color: '#ef4444' },
    { name: 'Unknown', value: dashboard_stats.device_compliance.unknown, color: '#64748b' }
  ];

  const groupActivityData = adminData.groups.map(group => ({
    name: group.name,
    messages: group.activity
  }));

  const latestIncidents = adminData.incidents
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <div className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Active Users</p>
              <p className="text-2xl font-bold text-slate-900">{dashboard_stats.active_users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserPlusIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-slate-900">{dashboard_stats.pending_approvals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Critical Incidents</p>
              <p className="text-2xl font-bold text-slate-900">{dashboard_stats.critical_incidents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Daily Messages</p>
              <p className="text-2xl font-bold text-slate-900">{dashboard_stats.daily_messages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">User Activity (30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboard_stats.user_activity_30d}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, 'Active Users']}
              />
              <Line type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Compliance Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Device Compliance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {complianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {complianceData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-slate-600">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Group Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="messages" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Latest Incidents */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Latest Incidents</h3>
          <div className="space-y-3">
            {latestIncidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">{incident.summary}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(incident.timestamp).toLocaleDateString()} • {incident.type}
                  </p>
                </div>
                <div className="ml-4">
                  <Badge 
                    variant={incident.severity === 'Critical' ? 'danger' : incident.severity === 'Warning' ? 'warning' : 'info'}
                  >
                    {incident.severity}
                  </Badge>
                </div>
              </div>
            ))}
            {latestIncidents.length === 0 && (
              <p className="text-center text-slate-500 py-8">No recent incidents</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;