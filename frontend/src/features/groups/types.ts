export interface KindergartenGroup {
  id: string;
  name: string;
  ageRange: string;
  roomNumber: string;
  mainTeacher: string;
  assistantTeacher: string;
  currentCount: number;
  capacity: number;
  colorTag: string;
}

export interface CreateGroupInput {
  name: string;
  ageRange: string;
  roomNumber: string;
  mainTeacher: string;
  capacity: number;
}
