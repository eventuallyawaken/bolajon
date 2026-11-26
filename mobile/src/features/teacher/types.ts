export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export interface TeacherGroup {
  id: string;
  name: string;
  ageRange: string;
  roomNumber: string;
  mainTeacher: string;
  currentCount: number;
  capacity: number;
}

export interface MorningFilterData {
  temperature: number;
  status: 'HEALTHY' | 'OBSERVATION';
  note?: string;
}

export interface StudentAttendanceItem {
  id: string;
  fullName: string;
  avatarUrl?: string;
  birthDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  allergies: string[];
  morningFilter: MorningFilterData;
  parentName: string;
  parentPhone: string;
  medicalNote?: string;
}

export interface TeacherDailyMeal {
  id: string;
  mealType: string;
  dishName: string;
  description: string;
  calories: string;
  time: string;
}

export interface PortionSummary {
  date: string;
  totalPresent: number;
  standardPortions: number;
  dietPortions: number;
  allergicStudents: Array<{
    studentName: string;
    allergen: string;
  }>;
  meals: TeacherDailyMeal[];
}
