import { ConflictException, Injectable } from '@nestjs/common';

import { Group } from '@prisma/client';

import { PrismaService } from '../common/orm/prisma.service';

import { CreateGroupDto } from './dto/createGroup.dto';

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    const existingGroup = await this.prismaService.group.findUnique({
      where: { name: createGroupDto.name },
    });

    if (existingGroup) {
      throw new ConflictException('Group with the same name already exists');
    }

    return this.prismaService.group.create({
      data: { name: createGroupDto.name },
    });
  }

  async getGroups(): Promise<Partial<Group>[]> {
    return this.prismaService.group.findMany();
  }
}
