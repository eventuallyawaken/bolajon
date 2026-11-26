export type ChildStatus = 'active' | 'vacation' | 'left';

export interface Child {
  id: string;
  fullName: string;
  initials: string;
  birthDate: string;
  gender: 'male' | 'female';
  groupName: string;
  parentName: string;
  parentPhone: string;
  status: ChildStatus;
  registeredDate: string;
  monthlyFee: string;
  debtAmount?: string;
}

export interface CreateChildInput {
  fullName: string;
  birthDate: string;
  gender: 'male' | 'female';
  groupName: string;
  parentName: string;
  parentPhone: string;
}
