import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { Group, Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { CreateGroupDto } from './dto/createGroup.dto';
import { CreateUserDto } from '../user/dto/createUser.dto';

@Controller('groups')
@ApiTags('Group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @UseGuards(JwtAuthGuard)
  async createGroup(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return await this.groupService.createGroup(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  @ApiCreatedResponse({
    description: 'List of groups',
    type: CreateGroupDto,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  async getGroups(): Promise<Partial<Group>[]> {
    return this.groupService.getGroups();
  }
}
