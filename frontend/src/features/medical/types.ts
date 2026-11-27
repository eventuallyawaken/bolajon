export type MedicalRecordType = 'checkup' | 'vaccination' | 'illness';

export interface MedicalRecordItem {
  id: string;
  childId: string;
  childName: string;
  groupName: string;
  recordType: MedicalRecordType;
  description: string;
  recordedByRole: string;
  checkedAt: string;
}

export interface MedicalFlaggedAttendance {
  id: string;
  childId: string;
  childName: string;
  groupName: string;
  temperature: number;
  healthStatus: string;
  notes: string;
  checkedBy: string;
}

export interface MedicalChildSummary {
  id: string;
  fullName: string;
  groupName: string;
  allergies: string;
  medicalNotes: string;
}

export interface MedicalOverviewData {
  todayDate: string;
  kpis: {
    totalChildren: number;
    checkedTodayCount: number;
    flaggedCount: number;
    allergyChildrenCount: number;
    recordsTotalCount: number;
  };
  flaggedAttendances: MedicalFlaggedAttendance[];
  allergyChildren: MedicalChildSummary[];
  childrenList: MedicalChildSummary[];
  recentRecords: MedicalRecordItem[];
}

export interface MenuAllergyAlertItem {
  id: string;
  mealType: string;
  dishName: string;
  description: string;
  time: string;
  calories: string;
  ingredients: string[];
  matchedChildren: {
    id: string;
    fullName: string;
    groupName: string;
    allergies: string;
  }[];
}
