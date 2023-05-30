import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/createUser.dto';
import { PasswordService } from '../password/password.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    public readonly passwordService: PasswordService,
  ) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    const passwordHash = await this.passwordService.hashPassword(
      userData.password,
    );
    return this.prismaService.user.create({
      data: {
        email: userData.email,
        password: passwordHash,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      },
    });
  }

  async getUsers(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }
}
