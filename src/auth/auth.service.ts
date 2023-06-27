import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './strategy/constants';
import { Role, User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { adminCredential } from '../common/credential/admin-credential';
import { ITokenPayload } from '../common/interface/tokenPayload.interface';
import { RefreshTokenDto } from './dto/refresh.dto';
import { PrismaService } from '../common/orm/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    if (email === adminCredential.email && pass === adminCredential.password) {
      const adminUser: Partial<User> = {
        id: adminCredential.id,
        email: adminCredential.email,
        password: adminCredential.password,
        role: 'ADMIN',
        isActive: true,
      };

      return adminUser as User;
    }

    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid login data');
    }

    if (!user.isActive && user.role !== Role.ADMIN) {
      throw new BadRequestException(
        "You have been blocked by the admin. Contact him, and don't forget to bring him a chocolate bar",
      );
    }

    const isPasswordValid =
      await this.userService.passwordService.comparePasswords(
        pass,
        user.password,
      );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid login data');
    }

    return await this.userService.updateLastLogin(user.id);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);
    const accessTokenPayload: ITokenPayload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      isActive: user.isActive,
    };

    const refreshTokenPayload: ITokenPayload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      isActive: user.isActive,
      refreshToken: true,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.accessTokenExpiresIn,
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.refreshTokenExpiresIn,
    });

    // Видалення старих записів з таблиці Token
    await this.prismaService.token.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Оновити токени користувача у базі даних
    await this.prismaService.token.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: jwtConstants.secret,
      });

      if (!decoded?.refreshToken) {
        throw new BadRequestException('Invalid refresh token');
      }

      const user = await this.userService.getUserByEmail(decoded.username);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const accessTokenPayload: ITokenPayload = {
        username: user.email,
        sub: user.id,
        role: user.role,
        isActive: user.isActive,
      };
      const newAccessToken = this.jwtService.sign(accessTokenPayload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.accessTokenExpiresIn,
      });

      const refreshTokenPayload: ITokenPayload = {
        username: user.email,
        sub: user.id,
        role: user.role,
        isActive: user.isActive,
        refreshToken: true,
      };

      const newRefreshToken = this.jwtService.sign(refreshTokenPayload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.refreshTokenExpiresIn,
      });

      // Видалення старих записів з таблиці Token
      await this.prismaService.token.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // Оновити токени користувача у базі даних
      await this.prismaService.token.create({
        data: {
          userId: user.id,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
