import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiCreatedResponse({ description: 'The created user', type: CreateUserDto })
  async createUser(
    @Body() userData: CreateUserDto,
  ): Promise<{ activationToken: string }> {
    try {
      const createdUser = await this.userService.createUser(userData);
      return { activationToken: createdUser.activationToken };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Patch('/activate/:activationToken')
  @ApiOperation({ summary: 'Activate a user' })
  @ApiCreatedResponse({ description: 'User activated successfully' })
  async activateUser(
    @Param('activationToken') activationToken: string,
    @Body('password') password: string,
  ): Promise<User> {
    return this.userService.activateUser(activationToken, password);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiCreatedResponse({ description: 'The updated user', type: CreateUserDto })
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() userData: Partial<CreateUserDto>,
    @Req() req,
  ): Promise<User> {
    const parsedUserId = parseInt(id);

    if (isNaN(parsedUserId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user: User = req.user;

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update user information');
    }

    return await this.userService.updateUser(parsedUserId, userData);
  }

  @Patch('/ban/:id')
  @ApiOperation({ summary: 'Ban a manager' })
  @ApiCreatedResponse({ description: 'Manager banned successfully' })
  @UseGuards(JwtAuthGuard)
  async banManager(
    @Param('id') id: string,
    @Req() req,
  ): Promise<{ isActive: boolean }> {
    const parsedUserId = parseInt(id);

    if (isNaN(parsedUserId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const adminUser: User = req.user;
    if (adminUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can ban managers');
    }

    return await this.userService.updateUserStatus(parsedUserId, false);
  }

  @Patch('/unban/:id')
  @ApiOperation({ summary: 'Unban a manager' })
  @ApiCreatedResponse({ description: 'Manager unbanned successfully' })
  @UseGuards(JwtAuthGuard)
  async unbanManager(
    @Param('id') id: string,
    @Req() req,
  ): Promise<{ isActive: boolean }> {
    const parsedUserId = parseInt(id);

    if (isNaN(parsedUserId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const adminUser: User = req.user;
    if (adminUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can unban managers');
    }

    return await this.userService.updateUserStatus(parsedUserId, true);
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
