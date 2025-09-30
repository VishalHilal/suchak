import React, { useState } from 'react';
import { CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { AdminData } from '../types';
import { exportToCsv } from '../utils/mockData';

interface ReportsProps {
  adminData: AdminData;
}

const Reports: React.FC<ReportsProps> = ({ adminData }) => {
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-01-31' });
  const [selectedReport, setSelectedReport] = useState('overview');

  // Generate report data
  const userActivityData = adminData.dashboard_stats.user_activity_30d.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: item.users,
    growth: Math.random() * 10 - 5 // Mock growth rate
  }));

  const groupActivityData = adminData.groups.map(group => ({
    name: group.name.length > 15 ? group.name.substring(0, 15) + '...' : group.name,
    messages: group.activity,
    members: group.members
  }));

  const complianceData = [
    { name: 'Compliant', value: adminData.dashboard_stats.device_compliance.compliant, color: '#22c55e' },
    { name: 'Non-Compliant', value: adminData.dashboard_stats.device_compliance.non_compliant, color: '#ef4444' },
    { name: 'Unknown', value: adminData.dashboard_stats.device_compliance.unknown, color: '#64748b' }
  ];

  const incidentData = adminData.incidents.reduce((acc, incident) => {
    const date = new Date(incident.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing[incident.severity.toLowerCase()]++;
      existing.total++;
    } else {
      acc.push({
        date,
        critical: incident.severity === 'Critical' ? 1 : 0,
        warning: incident.severity === 'Warning' ? 1 : 0,
        info: incident.severity === 'Info' ? 1 : 0,
        total: 1
      });
    }
    return acc;
  }, [] as any[]);

  const handleExportReport = (reportType: string) => {
    let data: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'user-activity':
        data = userActivityData;
        filename = 'user_activity_report';
        break;
      case 'group-activity':
        data = groupActivityData;
        filename = 'group_activity_report';
        break;
      case 'compliance':
        data = complianceData;
        filename = 'device_compliance_report';
        break;
      case 'incidents':
        data = incidentData;
        filename = 'incidents_report';
        break;
      default:
        data = [
          { metric: 'Total Users', value: adminData.users.length },
          { metric: 'Active Users', value: adminData.dashboard_stats.active_users },
          { metric: 'Total Devices', value: adminData.devices.length },
          { metric: 'Total Groups', value: adminData.groups.length },
          { metric: 'Open Incidents', value: adminData.incidents.filter(i => i.status === 'Open').length }
        ];
        filename = 'overview_report';
    }

    exportToCsv(data, filename);
  };

  const generatePDF = () => {
    // Mock PDF generation
    alert('PDF report would be generated in a real implementation');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExportReport(selectedReport)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={generatePDF}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Date Range:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setDateRange({ start: '2025-01-14', end: '2025-01-20' })}
              className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange({ start: '2024-12-21', end: '2025-01-20' })}
              className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange({ start: '2024-10-22', end: '2025-01-20' })}
              className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Last 90 Days
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'overview', name: 'System Overview', description: 'High-level metrics and KPIs' },
            { id: 'user-activity', name: 'User Activity', description: 'User engagement and growth' },
            { id: 'group-activity', name: 'Group Analytics', description: 'Group performance and usage' },
            { id: 'compliance', name: 'Device Compliance', description: 'Security compliance status' }
          ].map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 text-left border rounded-lg transition-colors ${
                selectedReport === report.id
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <h3 className="font-medium">{report.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{report.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">System Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Users:</span>
                <span className="font-medium text-slate-900">{adminData.users.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Active Users:</span>
                <span className="font-medium text-green-600">{adminData.dashboard_stats.active_users}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Groups:</span>
                <span className="font-medium text-slate-900">{adminData.groups.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Devices Managed:</span>
                <span className="font-medium text-slate-900">{adminData.devices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Daily Messages:</span>
                <span className="font-medium text-blue-600">{adminData.dashboard_stats.daily_messages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Open Incidents:</span>
                <span className="font-medium text-red-600">
                  {adminData.incidents.filter(i => i.status === 'Open').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Compliant Devices:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-600">
                    {adminData.dashboard_stats.device_compliance.compliant}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Non-Compliant:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-600">
                    {adminData.dashboard_stats.device_compliance.non_compliant}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Unknown Status:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="font-medium text-gray-600">
                    {adminData.dashboard_stats.device_compliance.unknown}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'user-activity' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Growth Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Statistics</h3>
            <div className="space-y-4">
              {adminData.users.reduce((acc: any[], user) => {
                const existing = acc.find(item => item.role === user.role);
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ role: user.role, count: 1 });
                }
                return acc;
              }, []).map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-slate-600">{stat.role}s:</span>
                  <span className="font-medium text-slate-900">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'group-activity' && (
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Group Activity Analysis</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={groupActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="messages" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedReport === 'compliance' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Device Compliance Distribution</h3>
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

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance Details</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-green-800">Compliant Devices</span>
                  <span className="text-2xl font-bold text-green-600">{complianceData[0].value}%</span>
                </div>
                <p className="text-sm text-green-700">
                  {Math.round((complianceData[0].value / 100) * adminData.devices.length)} devices passing all security checks
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-red-800">Non-Compliant Devices</span>
                  <span className="text-2xl font-bold text-red-600">{complianceData[1].value}%</span>
                </div>
                <p className="text-sm text-red-700">
                  {Math.round((complianceData[1].value / 100) * adminData.devices.length)} devices with security issues requiring attention
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Unknown Status</span>
                  <span className="text-2xl font-bold text-gray-600">{complianceData[2].value}%</span>
                </div>
                <p className="text-sm text-gray-700">
                  {Math.round((complianceData[2].value / 100) * adminData.devices.length)} devices pending initial attestation
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;