import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { Group } from '@prisma/client';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

@Controller('group')
@ApiTags('Group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @UseGuards(JwtAuthGuard)
  async createGroup(@Body('name') name: string): Promise<Group> {
    return await this.groupService.createGroup(name);
  }
}