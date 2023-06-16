import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { Role, User } from '@prisma/client';
import { CreateUserDto } from './dto/createUser.dto';
import { PasswordService } from '../password/password.service';
import { ERole } from '../common/enum/role.enum';

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

    const emailLowerCase = userData.email.toLowerCase();
    const roleUpperCase = userData.role.toString().toUpperCase();

    if (!Object.values(ERole).includes(roleUpperCase)) {
      throw new BadRequestException(
        'An invalid role has been entered. Please select a role from the list of available roles: ADMIN or MANAGER',
      );
    }

    return this.prismaService.user.create({
      data: {
        email: emailLowerCase,
        password: passwordHash,
        role: roleUpperCase as Role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      },
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
