import { Controller, Post, Body } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from '@prisma/client';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ description: 'The created user', type: CreateUserDto })
  async createUser(@Body() userData: CreateUserDto): Promise<User> {
    return this.userService.createUser(userData);
  }
}
