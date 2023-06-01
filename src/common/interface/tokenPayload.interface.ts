export interface ITokenPayload {
  username: string;
  sub: number;
  refreshToken?: boolean;
}
