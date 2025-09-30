import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import DeviceManagement from './pages/DeviceManagement';
import GroupManagement from './pages/GroupManagement';
import AuditLogs from './pages/AuditLogs';
import Incidents from './pages/Incidents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { UserRole, AdminData } from './types';
import { loadMockData } from './utils/mockData';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadMockData().then(setAdminData);
  }, []);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRole('Super Admin');
  };

  if (!adminData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentRole={currentRole}
        />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header 
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
            onLogout={handleLogout}
            adminData={adminData}
          />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard adminData={adminData} setAdminData={setAdminData} />} />
              <Route path="/users" element={<UserManagement adminData={adminData} setAdminData={setAdminData} currentRole={currentRole} />} />
              <Route path="/devices" element={<DeviceManagement adminData={adminData} setAdminData={setAdminData} currentRole={currentRole} />} />
              <Route path="/groups" element={<GroupManagement adminData={adminData} setAdminData={setAdminData} currentRole={currentRole} />} />
              <Route path="/audit" element={<AuditLogs adminData={adminData} setAdminData={setAdminData} />} />
              <Route path="/incidents" element={<Incidents adminData={adminData} setAdminData={setAdminData} currentRole={currentRole} />} />
              <Route path="/reports" element={<Reports adminData={adminData} />} />
              <Route path="/settings" element={<Settings currentRole={currentRole} adminData={adminData} setAdminData={setAdminData} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;