import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/createUser.dto';
import { PasswordService } from '../password/password.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
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
}
