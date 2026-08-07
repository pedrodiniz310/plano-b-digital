export interface User {
  id: string;
  name: string;
  email: string;
  guest: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}
