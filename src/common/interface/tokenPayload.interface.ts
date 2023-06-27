export interface ITokenPayload {
  username: string;
  sub: number;
  role: string;
  isActive: boolean;
  refreshToken?: boolean;
}

export interface IActivationTokenPayload {
  email: string;
}
