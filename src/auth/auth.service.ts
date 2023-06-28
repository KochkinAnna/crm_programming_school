import { BadRequestException, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/orm/prisma.service';
import { UserService } from '../user/user.service';

import { jwtConstants } from './strategy/constants';

import { Role, User } from '@prisma/client';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';

import { adminCredential } from '../common/credential/admin-credential';
import { ITokenPayload } from '../common/interface/tokenPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private userService: UserService,
  ) {}

  // Validates a user's credentials (email and password)
  // Валідація користувача на основі електронної пошти та пароля
  async validateUser(email: string, pass: string): Promise<User | null> {
    // Check if the user is the admin
    // Перевірка, чи є користувач адміністратором
    if (email === adminCredential.email && pass === adminCredential.password) {
      const adminUser: Partial<User> = {
        id: adminCredential.id,
        email: adminCredential.email,
        password: adminCredential.password,
        role: Role.ADMIN,
        isActive: true,
      };

      return adminUser as User;
    }

    // Check if the user exists
    // Перевірка, чи існує користувач
    const user: Partial<User> = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid login data');
    }

    // If the user is not active and not an admin, throw an error
    // Якщо користувач неактивний і не є адміністратором, викинути помилку
    if (!user.isActive && user.role !== Role.ADMIN) {
      throw new BadRequestException(
        "You have been blocked by the admin. Contact him, and don't forget to bring him a chocolate bar",
      );
    }

    // Check if the password is valid
    // Перевірка, чи є пароль вірним
    const isPasswordValid =
      await this.userService.passwordService.comparePasswords(
        pass,
        user.password,
      );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid login data');
    }

    // Update the user's last login and return the user object
    // Оновлення дати останнього входу користувача та повернення об'єкта користувача
    return await this.userService.updateLastLogin(user.id);
  }

  // Handles the login process
  // Обробка процесу входу користувача
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    // Create the access token payload
    // Створення токена доступу
    const accessTokenPayload: ITokenPayload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      isActive: user.isActive,
    };

    // Create the refresh token payload
    // Створення токена оновлення
    const refreshTokenPayload: ITokenPayload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      isActive: user.isActive,
      refreshToken: true,
    };

    // Generate the access token
    // Генерація токена доступу
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.accessTokenExpiresIn,
    });

    // Generate the refresh token
    // Генерація токена оновлення
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.refreshTokenExpiresIn,
    });

    // Delete existing tokens and create new tokens for the user
    // Видалення наявних токенів і створення нових токенів для користувача
    await this.prismaService.token.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await this.prismaService.token.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
      },
    });

    // Return the access token and refresh token
    // Повернення токена доступу та токена оновлення
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // Handles the refresh token process
  // Обробка процесу оновлення токена оновлення
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: jwtConstants.secret,
      });

      // Check if the refresh token is valid
      // Перевірка, чи є токен оновлення валідним
      if (!decoded?.refreshToken) {
        throw new BadRequestException('Invalid refresh token');
      }

      // Get the user associated with the refresh token
      // Отримання користувача, пов'язаного з токеном оновлення
      const user = await this.userService.getUserByEmail(decoded.username);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Create a new access token
      // Створення нового токена доступу
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

      // Create a new refresh token
      // Створення нового токена оновлення
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

      // Delete existing tokens and create new tokens for the user
      // Видалення наявних токенів і створення нових токенів для користувача
      await this.prismaService.token.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await this.prismaService.token.create({
        data: {
          userId: user.id,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });

      // Return the new access token and refresh token
      // Повернення нового токена доступу та токена оновлення
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
