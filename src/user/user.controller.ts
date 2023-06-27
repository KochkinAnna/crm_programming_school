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
  // @UseGuards(JwtAuthGuard)
  async createUser(@Body() userData: CreateUserDto): Promise<any> {
    // const user: User = req.user;
    //
    // if (user.role !== Role.ADMIN) {
    //   throw new ForbiddenException('Only admins can create users');
    // }

    try {
      const createdUser = await this.userService.createUser(userData);

      const activationToken = await this.userService.generateActivationToken(
        createdUser.user.id,
      );

      return {
        user: createdUser.user,
        activationToken,
      };
    } catch (error) {
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

  @Post('/activationToken/:userId')
  @ApiOperation({ summary: 'Request activation token' })
  @ApiCreatedResponse({ description: 'Activation token sent successfully' })
  async requestActivationToken(
    @Param('userId') userId: number,
  ): Promise<{ activationToken: string }> {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activationToken = await this.userService.generateActivationToken(
      user.id,
    );
    return { activationToken };
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
  @UseGuards(JwtAuthGuard)
  async getUsers(@Req() req): Promise<Partial<User>[]> {
    const adminUser: User = req.user;
    if (adminUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can get all users');
    }

    return this.userService.getUsers();
  }

  @Get('/byEmail/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiCreatedResponse({ description: 'The user', type: CreateUserDto })
  @UseGuards(JwtAuthGuard)
  async getUserByEmail(
    @Param('email') email: string,
    @Req() req,
  ): Promise<User | null> {
    const adminUser: User = req.user;
    if (adminUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can get user by email');
    }

    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Delete('/byEmail/:email')
  @ApiOperation({ summary: 'Delete user by email' })
  @ApiCreatedResponse({ description: 'The deleted user', type: CreateUserDto })
  @UseGuards(JwtAuthGuard)
  async deleteUserByEmail(
    @Param('email') email: string,
    @Req() req,
  ): Promise<void> {
    const adminUser: User = req.user;
    if (adminUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete user by email');
    }

    try {
      await this.userService.deleteUserByEmail(email);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  @Get('/byID/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiCreatedResponse({ description: 'The user', type: CreateUserDto })
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string, @Req() req): Promise<User | null> {
    const adminUser: User = req.user;
    if (adminUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can get user by ID');
    }

    const parsedUserId = parseInt(id);

    if (isNaN(parsedUserId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userService.getUserById(parsedUserId);
  }

  @Delete('/byID/:id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiCreatedResponse({ description: 'The deleted user', type: CreateUserDto })
  @UseGuards(JwtAuthGuard)
  async deleteUserById(@Param('id') id: string, @Req() req): Promise<void> {
    const adminUser: User = req.user;
    if (adminUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete user by email');
    }
    const parsedUserId = parseInt(id);

    if (isNaN(parsedUserId)) {
      throw new BadRequestException('Invalid user ID');
    }
    await this.userService.deleteUserById(parsedUserId);
  }
}
