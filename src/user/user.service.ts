import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { Role, User } from '@prisma/client';
import { CreateUserDto } from './dto/createUser.dto';
import { PasswordService } from '../password/password.service';
import { generateActivationToken } from '../common/utils/activationToken.utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    public readonly passwordService: PasswordService,
  ) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    const emailLowerCase = userData.email.toLowerCase();

    const activationToken = generateActivationToken();
    const userToCreate: any = {
      email: emailLowerCase,
      firstName: userData.firstName,
      lastName: userData.lastName,
      activationToken,
    };

    return await this.prismaService.user.create({
      data: userToCreate,
    });
  }

  async activateUser(activationToken: string, password: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { activationToken },
    });

    if (!user) {
      throw new BadRequestException('Invalid activation token');
    }

    const passwordHash = await this.passwordService.hashPassword(password);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        activationToken: null,
        role: Role.MANAGER,
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
    return await this.prismaService.user.update({
      where: { id: userId },
      data: userData,
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
}
