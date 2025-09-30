export type UserRole = 'Super Admin' | 'Group Admin' | 'Auditor';

export type UserStatus = 'Active' | 'Pending' | 'Suspended';

export type DeviceCompliance = 'Compliant' | 'Rooted' | 'Unknown';

export type GroupType = 'Operational' | 'Family' | 'Veteran';

export type IncidentSeverity = 'Info' | 'Warning' | 'Critical';

export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved';

export interface User {
  id: string;
  name: string;
  role: string;
  service_id: string;
  email: string;
  phone: string;
  status: UserStatus;
  last_login: string | null;
  device_id: string | null;
  verified: boolean;
  joined_at: string;
  groups: number;
}

export interface Device {
  device_id: string;
  user_id: string;
  model: string;
  os: string;
  compliance: DeviceCompliance;
  attested_at: string;
  ip: string;
  safety_score: number;
}

export interface Group {
  group_id: string;
  name: string;
  type: GroupType;
  members: number;
  pending_requests: Array<{
    user_id: string;
    user_name: string;
    requested_at: string;
    reason: string;
  }>;
  activity: number;
  created_at: string;
}

export interface Incident {
  id: string;
  type: string;
  severity: IncidentSeverity;
  timestamp: string;
  user_id: string;
  status: IncidentStatus;
  summary: string;
  description: string;
  assigned_to: string | null;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
  severity: IncidentSeverity;
}

export interface DashboardStats {
  active_users: number;
  pending_approvals: number;
  critical_incidents: number;
  daily_messages: number;
  device_compliance: {
    compliant: number;
    non_compliant: number;
    unknown: number;
  };
  user_activity_30d: Array<{
    date: string;
    users: number;
  }>;
}

export interface AdminData {
  users: User[];
  devices: Device[];
  groups: Group[];
  incidents: Incident[];
  messages_stats: Array<{
    group_id: string;
    date: string;
    messages: number;
  }>;
  audit_logs: AuditLog[];
  dashboard_stats: DashboardStats;
}