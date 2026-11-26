export type StaffRole =
  | 'Tarbiyachi'
  | 'Yordamchi tarbiyachi'
  | 'Hamshira'
  | 'Bosh oshpaz'
  | 'Direktor'
  | 'Bosh hisobchi'
  | 'Qo‘riqchi / Qorovul';

export interface StaffMember {
  id: string;
  fullName: string;
  role: StaffRole;
  phone: string;
  groupAssigned?: string;
  salary: number;
  status: 'active' | 'leave';
  hiredDate: string;
}

export interface CreateStaffInput {
  fullName: string;
  role: StaffRole;
  phone: string;
  groupAssigned?: string;
  salary: number;
}
