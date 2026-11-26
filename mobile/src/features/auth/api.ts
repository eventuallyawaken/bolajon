import { http, isMockMode } from '../../shared/api/http';
import type { LoginCredentials, LoginResponse } from './types';
import type { AuthUser, UserRole } from '../../shared/store/useAuthStore';

function mapBackendRole(rawRole: string | undefined): UserRole {
  const lower = (rawRole || '').toLowerCase();
  if (lower === 'parent' || lower === 'ota_ona') {
    return 'parent';
  }
  return 'teacher';
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse & { refreshToken?: string }> => {
    if (isMockMode()) {
      const isTeacher = credentials.phone.includes('234') || credentials.phone.includes('teacher');
      const mockUser: AuthUser = isTeacher
        ? {
            id: 'usr-teacher-demo',
            fullName: 'Zilola Rahimova',
            phone: credentials.phone || '+998 90 234 11 22',
            role: 'teacher',
            rawRole: 'teacher',
            groupName: 'Kichkintoylar guruhi',
            branchName: 'Chilonzor filiali',
            branchId: 'branch-chilonzor',
          }
        : {
            id: 'usr-parent-demo',
            fullName: 'Shavkat Rahimov',
            phone: credentials.phone || '+998 90 777 88 99',
            role: 'parent',
            rawRole: 'parent',
            children: [
              { id: 'child-1', fullName: 'Aliyev Temur', groupName: 'Kichkintoylar guruhi (2-3 yosh)' },
              { id: 'child-2', fullName: 'Aliyeva Madina', groupName: 'Yulduzcha guruhi (4-5 yosh)' },
            ],
          };

      return {
        user: mockUser,
        token: `mock_jwt_${Date.now()}`,
      };
    }

    const response = await http.post('/auth/login', {
      phone: credentials.phone.trim(),
      password: credentials.password,
    });

    const payload = response.data?.data || response.data;
    const rawUser = payload?.user;
    const accessToken = payload?.accessToken || payload?.token;
    const refreshToken = payload?.refreshToken;

    if (!rawUser || !accessToken) {
      throw new Error('Serverdan noto‘g‘ri javob qaytdi');
    }

    const mappedRole = mapBackendRole(rawUser.role);

    return {
      user: {
        id: rawUser.id,
        fullName: rawUser.fullName,
        phone: rawUser.phone,
        email: rawUser.email,
        role: mappedRole,
        rawRole: rawUser.role,
        tenantId: rawUser.tenantId,
        tenantName: rawUser.tenantName,
        branchId: rawUser.branchId,
        branchName: rawUser.branchName,
        groupId: rawUser.groupId,
        groupName: rawUser.groupName,
        children: rawUser.children,
      },
      token: accessToken,
      refreshToken,
    };
  },
};
