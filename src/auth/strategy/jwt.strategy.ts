import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: {
    sub: number;
    username: string;
    role: string;
    isActive: boolean;
  }): Promise<{
    userId: number;
    username: string;
    role: string;
    isActive: boolean;
  }> {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      isActive: payload.isActive,
    };
  }
}
