import { http } from '@/shared/api/http';
import type { DashboardData } from './types';

export const dashboardApi = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const res = await http.get('/dashboard/stats');
      const d = res.data.data;
      if (d && d.kpis && d.branchName) return d;
      return {
        branchName: d?.branchName || 'Chilonzor filiali',
        greetingUser: d?.greetingUser || 'Dilnoza Murodova',
        todayDate: new Date().toLocaleDateString('uz-UZ'),
        kpis: [
          { id: '1', label: 'Jami bolalar', value: String(d?.totalChildren || 0), subValue: 'Faol tarbiyalanuvchilar', colorClass: 'teal' },
          { id: '2', label: 'Bugungi davomat', value: `${d?.todayAttendancePercent || 0}%`, subValue: 'Kelgan bolalar', colorClass: 'green' },
          { id: '3', label: 'Tarbiyachilar', value: String(d?.totalTeachers || 0), subValue: 'Faol pedagoglar', colorClass: 'blue' },
          { id: '4', label: 'Oylik tushum', value: `${Number(d?.monthlyRevenue || 0).toLocaleString()} so‘m`, subValue: 'Kassa va bank', colorClass: 'amber' },
        ],
        recentPayments: d?.recentPayments || [],
        groupAttendance: d?.groupAttendance || [],
      };
    } catch {
      return {
        branchName: 'Chilonzor filiali',
        greetingUser: 'Direktor',
        todayDate: new Date().toLocaleDateString('uz-UZ'),
        kpis: [
          { id: '1', label: 'Jami bolalar', value: '0', subValue: 'Faol tarbiyalanuvchilar', colorClass: 'teal' },
          { id: '2', label: 'Bugungi davomat', value: '0%', subValue: 'Kelgan bolalar', colorClass: 'green' },
          { id: '3', label: 'Tarbiyachilar', value: '0', subValue: 'Faol pedagoglar', colorClass: 'blue' },
          { id: '4', label: 'Oylik tushum', value: '0 so‘m', subValue: 'Kassa va bank', colorClass: 'amber' },
        ],
        recentPayments: [],
        groupAttendance: [],
      };
    }
  },
};
