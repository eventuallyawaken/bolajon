import { http } from '@/shared/api/http';
import type {
  MedicalOverviewData,
  MedicalRecordItem,
  MedicalRecordType,
  MenuAllergyAlertItem,
} from './types';

export const medicalApi = {
  async getOverview(): Promise<MedicalOverviewData> {
    const res = await http.get('/medical/overview');
    return res.data.data;
  },

  async getRecords(childId?: string, recordType?: string): Promise<MedicalRecordItem[]> {
    const res = await http.get('/medical/records', {
      params: {
        ...(childId && childId !== 'all' ? { childId } : {}),
        ...(recordType && recordType !== 'all' ? { recordType } : {}),
      },
    });
    return res.data?.data || [];
  },

  async createRecord(input: {
    childId: string;
    recordType: MedicalRecordType;
    description: string;
    checkedAt?: string;
  }): Promise<MedicalRecordItem> {
    const res = await http.post('/medical/records', input);
    return res.data.data;
  },

  async updateChildMedical(
    childId: string,
    input: { allergies?: string | null; medicalNotes?: string | null }
  ): Promise<{ id: string; fullName: string; allergies: string; medicalNotes: string }> {
    const res = await http.patch(`/medical/children/${childId}`, input);
    return res.data.data;
  },

  async getMenuAllergies(): Promise<MenuAllergyAlertItem[]> {
    const res = await http.get('/medical/menu-allergies');
    return res.data?.data || [];
  },
};
