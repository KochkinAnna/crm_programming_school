import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { Role, User } from '@prisma/client';
import { CreateUserDto } from './dto/createUser.dto';
import { PasswordService } from '../password/password.service';
import { generateActivationToken } from '../common/utils/activationToken.utils';
import { capitalizeFirstLetter } from '../common/utils/capitalizeFirstLetter.util';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    public readonly passwordService: PasswordService,
  ) {}

  async createUser(
    userData: CreateUserDto,
  ): Promise<{ activationToken: string }> {
    const emailLowerCase = userData.email.toLowerCase();
    const activationToken = generateActivationToken();
    const userToCreate = {
      email: emailLowerCase,
      firstName: capitalizeFirstLetter(userData.firstName),
      lastName: capitalizeFirstLetter(userData.lastName),
      role: Role.MANAGER,
      phone: userData.phone,
      activationToken,
    };

    try {
      await this.prismaService.user.create({
        data: userToCreate,
      });

      return { activationToken };
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

  async activateUser(activationToken: string, password: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { activationToken },
    });

    if (!user) {
      throw new BadRequestException('Invalid activation token');
    }

    const passwordHash = await this.passwordService.hashPassword(password);

    return await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        activationToken: null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
      },
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id } });
  }

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

    return await this.prismaService.user.update({
      where: { id: userId },
      data: updatedUserData,
    });
  }

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

  async getUserByEmail(email: string): Promise<User | null> {
    const lowercaseEmail = email.toLowerCase();
    return this.prismaService.user.findUnique({
      where: { email: lowercaseEmail },
    });
  }

  async deleteUserByEmail(email: string): Promise<void> {
    const lowercaseEmail = email.toLowerCase();
    await this.prismaService.user.delete({ where: { email: lowercaseEmail } });
  }

  async deleteUserById(id: number): Promise<void> {
    await this.prismaService.user.delete({ where: { id } });
  }

  async updateLastLogin(userId: number): Promise<User> {
    return await this.prismaService.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

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
