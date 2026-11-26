import { http } from '@/shared/api/http';

export const authApi = {
  async login(phone: string, password: string) {
    const res = await http.post('/auth/login', { phone, password });
    return res.data.data;
  },

  async getMe() {
    const res = await http.get('/auth/me');
    return res.data.data;
  },

  async logout() {
    const res = await http.post('/auth/logout');
    return res.data;
  },

  async refreshToken() {
    const res = await http.post('/auth/refresh');
    return res.data.data;
  },
};
