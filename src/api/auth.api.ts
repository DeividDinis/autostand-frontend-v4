import { api, unwrap } from './client';
import type { AuthUser } from '../types/domain';

export type AuthLoginData = { token: string };

export const authApi = {
  async login(body: { email: string; password: string }): Promise<AuthLoginData> {
    return unwrap(await api.post<AuthLoginData>('/auth/login', body));
  },
  async me(): Promise<AuthUser> {
    return unwrap(await api.get<AuthUser>('/auth/me'));
  },
};
