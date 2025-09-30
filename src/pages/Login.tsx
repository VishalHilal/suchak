import React, { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin');

  const handleLogin = () => {
    // Simulate authentication delay
    setTimeout(() => {
      onLogin(selectedRole);
    }, 1000);
  };

  const roles: UserRole[] = ['Super Admin', 'Group Admin', 'Auditor'];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <ShieldCheckIcon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">SUCHAK</h1>
          <p className="text-slate-600">Admin Console</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              defaultValue="admin@suchak.gov.in"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password  
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              defaultValue="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Demo Role (For Testing)
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors font-medium"
          >
            Sign In
          </button>

          <div className="text-center text-sm text-slate-500">
            <p>Mock Authentication - No real credentials required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;