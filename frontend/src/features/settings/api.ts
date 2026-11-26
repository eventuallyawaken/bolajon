import { http } from '@/shared/api/http';
import type { KindergartenSettings } from './types';

export const settingsApi = {
  async getSettings(): Promise<KindergartenSettings> {
    try {
      const res = await http.get('/settings');
      return res.data.data;
    } catch {
      return {
        orgName: 'Bolajon Ziyo MCHJ (Xususiy MTT)',
        stir: '309876543',
        directorName: 'Dilnoza Murodova',
        phone: '+998 90 123 45 67',
        email: 'info@bolajon-ziyo.uz',
        address: 'Toshkent sh., Chilonzor tumani, 9-mavze, 24-uy',
        monthlyFee: 1800000,
        bankAccount: '20208000900123456001',
        mfo: '00401',
        bankName: 'O‘zmilliybank Chilonzor filiali',
        smsNotificationsEnabled: true,
        morningCheckStrict: true,
        autoRemindDebtors: true,
      };
    }
  },

  async updateSettings(newSettings: Partial<KindergartenSettings>): Promise<KindergartenSettings> {
    const res = await http.put('/settings', newSettings);
    return res.data.data;
  },

  async updateProfile(data: { fullName?: string; phone?: string; email?: string | null }) {
    const res = await http.patch('/auth/profile', data);
    return res.data.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await http.post('/auth/change-password', data);
    return res.data;
  },
};
