import { http, isMockMode } from '../../shared/api/http';
import type {
  ChildInfo,
  ParentChildOverview,
  MenuMeal,
  ParentPaymentsData,
} from './types';
import {
  mockChildren,
  mockTodayAttendance,
  mockMonthStats,
  mockWeeklyMenu,
  mockPaymentsHistory,
  mockBalanceOverview,
} from './mock';

function mapHealthStatus(raw?: string): 'HEALTHY' | 'FLU' | 'QUARANTINE' | 'OBSERVATION' {
  const s = (raw || 'healthy').toLowerCase();
  if (s === 'flu') return 'FLU';
  if (s === 'quarantine') return 'QUARANTINE';
  if (s === 'observation') return 'OBSERVATION';
  return 'HEALTHY';
}

export const parentApi = {
  getChildren: async (): Promise<ChildInfo[]> => {
    if (isMockMode()) {
      return mockChildren;
    }
    const response = await http.get('/parent/children');
    return response.data?.data || [];
  },

  getChildOverview: async (childId: string, date?: string): Promise<ParentChildOverview> => {
    if (isMockMode()) {
      const att = mockTodayAttendance[childId] || mockTodayAttendance['child-1'];
      const st = mockMonthStats[childId] || mockMonthStats['child-1'];
      return {
        childId,
        date: date || new Date().toISOString().slice(0, 10),
        todayAttendance: att,
        monthStats: st,
        latestNotification: {
          id: 'demo-notice-1',
          title: 'Bog‘cha ma’muriyatidan eslatma',
          message: 'Ertaga soat 10:00 da ochiq mashg‘ulotlar kuni bo‘lib o‘tadi.',
          type: 'info',
          createdAt: new Date().toISOString(),
        },
      };
    }

    const response = await http.get(`/parent/children/${childId}/overview`, {
      params: date ? { date } : undefined,
    });
    const d = response.data?.data;

    return {
      childId: d.childId,
      date: d.date,
      todayAttendance: d.todayAttendance
        ? {
            childId: d.childId,
            date: d.date,
            status: (d.todayAttendance.status || 'PRESENT') as 'PRESENT' | 'LATE' | 'ABSENT',
            checkInTime: d.todayAttendance.checkTime,
            morningFilter: {
              temperature: Number(d.todayAttendance.temperature ?? 36.6),
              status: mapHealthStatus(d.todayAttendance.healthStatus),
              checkedBy: d.todayAttendance.checkedBy || 'Tarbiyachi',
              checkTime: d.todayAttendance.checkTime || '08:30',
              note: d.todayAttendance.notes || undefined,
            },
            teacherNote: d.todayAttendance.notes || undefined,
          }
        : null,
      monthStats: d.monthStats,
      latestNotification: d.latestNotification || null,
    };
  },

  getMenu: async (childId?: string): Promise<MenuMeal[]> => {
    if (isMockMode()) {
      const firstDay = mockWeeklyMenu[0];
      return firstDay.meals.map((m, idx) => ({
        id: `mock-meal-${idx}`,
        mealType: m.title,
        dishName: m.items[0] || m.title,
        description: m.items.slice(1).join(', '),
        calories: `${m.calories} kkal`,
        time: m.time,
        ingredients: m.allergens.map((a) => ({ name: a, amountPerChild: 1, unit: 'porsiya' })),
      }));
    }

    const response = await http.get('/parent/menu', {
      params: childId ? { childId } : undefined,
    });
    return response.data?.data || [];
  },

  getPayments: async (childId: string): Promise<ParentPaymentsData> => {
    if (isMockMode()) {
      const bal = mockBalanceOverview[childId] || mockBalanceOverview['child-1'];
      const list = mockPaymentsHistory[childId] || mockPaymentsHistory['child-1'];
      return {
        balanceOverview: {
          monthlyFee: bal.monthlyFee,
          debtAmount: bal.debtAmount,
          lastPaymentDate: bal.lastPaymentDate,
        },
        payments: list,
      };
    }

    const response = await http.get(`/parent/children/${childId}/payments`);
    return response.data?.data;
  },
};
