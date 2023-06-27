import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { Role, User, Token } from '@prisma/client';
import { CreateUserDto } from './dto/createUser.dto';
import { PasswordService } from '../password/password.service';
import { capitalizeFirstLetter } from '../common/utils/capitalizeFirstLetter.util';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/strategy/constants';
import { IActivationTokenPayload } from '../common/interface/tokenPayload.interface';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    public readonly passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async createUser(userData: CreateUserDto) {
    try {
      const emailLowerCase = userData.email.toLowerCase();
      const createdUser = await this.prismaService.user.create({
        data: {
          email: emailLowerCase,
          firstName: capitalizeFirstLetter(userData.firstName),
          lastName: capitalizeFirstLetter(userData.lastName),
          role: Role.ADMIN,
          phone: userData.phone,
        },
      });

      const activationToken = await this.generateActivationToken(
        createdUser.id,
      );

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

  async generateActivationToken(userId: number) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const activationTokenPayload: IActivationTokenPayload = {
        email: user.email,
      };

      const activationToken = this.jwtService.sign(activationTokenPayload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.activationTokenExpiresIn,
      });

      const existingToken = await this.prismaService.token.findUnique({
        where: { activationToken },
      });

      if (existingToken) {
        return this.generateActivationToken(userId);
      }

      const accessToken = uuid();
      const refreshToken = uuid();

      await this.prismaService.token.create({
        data: {
          accessToken,
          refreshToken,
          activationToken,
          user: { connect: { id: userId } },
        },
      });

      return activationToken;
    } catch (error) {
      throw error;
    }
  }

  async activateUser(activationToken: string, password: string): Promise<User> {
    const userToken = await this.prismaService.token.findUnique({
      where: { activationToken },
      include: { user: true },
    });

    if (!userToken) {
      throw new BadRequestException('Invalid activation token');
    }

    const userId = userToken.user.id;

    const passwordHash = await this.passwordService.hashPassword(password);

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        isActive: true,
      },
    });

    return this.prismaService.user.findUnique({
      where: { id: userId },
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
