import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { Group } from '@prisma/client';
import { CreateGroupDto } from './dto/createGroup.dto';

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    return this.prismaService.group.create({
      data: { name: createGroupDto.name },
    });
  }
}
