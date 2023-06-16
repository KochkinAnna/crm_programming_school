import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from '@prisma/client';

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() userData: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userService.getUserByEmail(
        userData.email,
      );
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      return this.userService.createUser(userData);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiCreatedResponse({
    description: 'List of users',
    type: CreateUserDto,
    isArray: true,
  })
  async getUsers(): Promise<Partial<User>[]> {
    return this.userService.getUsers();
  }

  @Get('/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiCreatedResponse({ description: 'The user', type: CreateUserDto })
  async getUserByEmail(@Param('email') email: string): Promise<User | null> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Delete('/:email')
  @ApiOperation({ summary: 'Delete user by email' })
  @ApiCreatedResponse({ description: 'The deleted user', type: CreateUserDto })
  async deleteUserByEmail(@Param('email') email: string): Promise<void> {
    try {
      await this.userService.deleteUserByEmail(email);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
}
