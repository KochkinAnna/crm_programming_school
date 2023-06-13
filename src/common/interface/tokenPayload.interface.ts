export interface ITokenPayload {
  username: string;
  sub: number;
  role: string;
  refreshToken?: boolean;
}
