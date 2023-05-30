import { Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './strategy/constants';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { adminCredentials } from '../common/credential/admin-credential';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    if (
      email === adminCredentials.email &&
      pass === adminCredentials.password
    ) {
      const adminUser: Partial<User> = {
        email: adminCredentials.email,
        password: adminCredentials.password,
      };

      return adminUser as User;
    }

    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid login data');
    }

    const isPasswordValid =
      await this.userService.passwordService.comparePasswords(
        pass,
        user.password,
      );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid login data');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtConstants.secret,
      }),
    };
  }
}
