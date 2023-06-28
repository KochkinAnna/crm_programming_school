import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { v4 as uuid } from 'uuid';

import { Role, User } from '@prisma/client';

import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../password/password.service';
import { PrismaService } from '../common/orm/prisma.service';

import { CreateUserDto } from './dto/createUser.dto';
import { capitalizeFirstLetter } from '../common/utils/capitalizeFirstLetter.util';
import { jwtConstants } from '../auth/strategy/constants';
import { IActivationTokenPayload } from '../common/interface/tokenPayload.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    public readonly passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  // Create a new user
  // Створюємо нового користувача
  async createUser(userData: CreateUserDto) {
    try {
      const emailLowerCase = userData.email.toLowerCase();

      // Create a new user in the database with Prisma
      // Створюємо нового користувача в базі даних за допомогою Prisma
      const createdUser = await this.prismaService.user.create({
        data: {
          email: emailLowerCase,
          firstName: capitalizeFirstLetter(userData.firstName),
          lastName: capitalizeFirstLetter(userData.lastName),
          role: Role.MANAGER,
          phone: userData.phone,
        },
      });

      // Generate an activation token for a new user
      // Генеруємо токен активації для нового користувача
      const activationToken = await this.generateActivationToken(
        createdUser.id,
      );

      // Return the created user and activation token
      // Повертаємо створеного користувача та токен активації
      return { user: createdUser, activationToken };
    } catch (error) {
      if (
        error.message.includes(
          'Unique constraint failed on the constraint: `users_email_key`',
        )
      ) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }
  }

  // Generate an activation token for a user
  // Генеруємо токен активації для користувача
  async generateActivationToken(userId: number) {
    try {
      // Find the user by his ID in the database
      // Знаходимо користувача за його ідентифікатором у базі даних
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      // Preparing data for signing the token
      // Підготовка даних для підпису токена
      const activationTokenPayload: IActivationTokenPayload = {
        email: user.email,
      };

      // Generate an activation token using JwtService
      // Генеруємо токен активації за допомогою JwtService
      const activationToken = this.jwtService.sign(activationTokenPayload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.activationTokenExpiresIn,
      });

      // Check if the activation token already exists in the database
      // Перевіряємо, чи не існує вже такого токену активації в базі даних
      const existingToken = await this.prismaService.token.findUnique({
        where: { activationToken },
      });

      if (existingToken) {
        // If such a token already exists, generate a new token
        // Якщо такий токен вже існує, генеруємо новий токен
        return this.generateActivationToken(userId);
      }

      // Generate available and renewable tokens
      // Генеруємо доступовий та оновлювальний токени
      const accessToken = uuid();
      const refreshToken = uuid();

      // Save the activation token in the database
      // Зберігаємо токен активації в базі даних
      await this.prismaService.token.create({
        data: {
          accessToken,
          refreshToken,
          activationToken,
          user: { connect: { id: userId } },
        },
      });

      // Return the activation token
      // Повертаємо токен активації
      return activationToken;
    } catch (error) {
      throw error;
    }
  }

  // Activate a user using the activation token and sets the password
  // Активуємо користувача за допомогою токена активації та встановлює пароль
  async activateUser(
    activationToken: string,
    password: string,
  ): Promise<Partial<User>> {
    // Find the activation token and the associated user in the database
    // Знаходимо токен активації та пов'язаного з ним користувача в базі даних
    const userToken = await this.prismaService.token.findUnique({
      where: { activationToken },
      include: { user: true },
    });

    if (!userToken) {
      throw new BadRequestException('Invalid activation token');
    }

    const userId = userToken.user.id;

    // Hash the user's password using PasswordService
    // Хешуємо пароль користувача за допомогою PasswordService
    const passwordHash = await this.passwordService.hashPassword(password);

    // Update user information (password and activity status)
    // Оновлюємо інформацію користувача (пароль та статус активності)
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        isActive: true,
      },
    });

    // Return the updated user
    // Повертаємо оновленого користувача
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Updates a user's information
  // Оновлює інформацію користувача
  async updateUser(
    userId: number,
    userData: Partial<CreateUserDto>,
  ): Promise<User> {
    const updatedUserData: Partial<CreateUserDto> = {};

    if (userData.email) {
      updatedUserData.email = userData.email.toLowerCase();
    }

    if (userData.firstName) {
      updatedUserData.firstName = capitalizeFirstLetter(userData.firstName);
    }

    if (userData.lastName) {
      updatedUserData.lastName = capitalizeFirstLetter(userData.lastName);
    }

    if (userData.phone) {
      updatedUserData.phone = userData.phone;
    }

    // Update user information in the database
    // Оновлюємо інформацію користувача в базі даних
    return await this.prismaService.user.update({
      where: { id: userId },
      data: {
        email: updatedUserData.email,
        firstName: updatedUserData.firstName,
        lastName: updatedUserData.lastName,
        phone: updatedUserData.phone,
      },
    });
  }

  // Retrieve all users
  // Отримуємо всіх користувачів
  async getUsers(): Promise<Partial<User>[]> {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        lastLogin: true,
      },
    });
  }

  // Retrieve a user by their ID
  // Отримуємо користувача за його ідентифікатором
  async getUserById(id: number): Promise<Partial<User>> {
    return this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        lastLogin: true,
      },
    });
  }

  // Retrieve a user by their email
  // Отримуємо користувача за його електронною поштою
  async getUserByEmail(email: string): Promise<Partial<User>> {
    const lowercaseEmail = email.toLowerCase();
    return this.prismaService.user.findUnique({
      where: { email: lowercaseEmail },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        lastLogin: true,
      },
    });
  }

  // Delete a user by their email
  // Видаляємо користувача за його електронною поштою
  async deleteUserByEmail(email: string): Promise<void> {
    const lowercaseEmail = email.toLowerCase();
    await this.prismaService.user.delete({ where: { email: lowercaseEmail } });
  }

  // Delete a user by their ID
  // Видаляємо користувача за його ідентифікатором
  async deleteUserById(id: number): Promise<void> {
    await this.prismaService.user.delete({ where: { id } });
  }

  // Update the last login timestamp of a user
  // Оновлюємо мітку часу останнього входу користувача
  async updateLastLogin(userId: number): Promise<User> {
    return await this.prismaService.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  // Update the active status of a user
  // Оновлюємо активний статус користувача
  async updateUserStatus(
    userId: number,
    isActive: boolean,
  ): Promise<{ isActive: boolean }> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return { isActive };
  }
}
