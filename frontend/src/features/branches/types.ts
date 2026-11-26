export interface BranchItem {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  childrenCount: number;
  capacity: number;
  groupsCount: number;
  status: 'active' | 'maintenance';
}

export interface CreateBranchInput {
  name: string;
  address: string;
  manager: string;
  phone: string;
  capacity: number;
  groupsCount?: number;
  status?: 'active' | 'maintenance';
}
