import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { Group } from '@prisma/client';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { CreateGroupDto } from './dto/createGroup.dto';

@Controller('group')
@ApiTags('Group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @UseGuards(JwtAuthGuard)
  async createGroup(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    const { name } = createGroupDto;
    return await this.groupService.createGroup(name);
  }
}
