export type HealthStatus =
  | 'healthy'
  | 'cold'
  | 'fever'
  | 'complaint'
  | 'flu'
  | 'quarantine';

export interface AttendanceRecord {
  id: string;
  childId: string;
  childName: string;
  initials: string;
  groupName: string;
  isPresent: boolean;
  temperature: number;
  healthStatus: HealthStatus;
  notes: string;
}

export interface AttendanceGroupSummary {
  total: number;
  present: number;
  absent: number;
  healthChecked: number;
}
