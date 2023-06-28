import { ConflictException, Injectable } from '@nestjs/common';

import { Group } from '@prisma/client';

import { PrismaService } from '../common/orm/prisma.service';

import { CreateGroupDto } from './dto/createGroup.dto';

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) {}

  // Creates a new group
  // Створення нової групи
  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    // Check if a group with the same name already exists
    // Перевірка, чи існує група з такою самою назвою
    const existingGroup = await this.prismaService.group.findUnique({
      where: { name: createGroupDto.name },
    });

    if (existingGroup) {
      throw new ConflictException('Group with the same name already exists');
    }

    // Create a new group
    // Створення нової групи
    return this.prismaService.group.create({
      data: { name: createGroupDto.name },
    });
  }

  // Retrieves all groups
  // Отримання всіх груп
  async getGroups(): Promise<Partial<Group>[]> {
    return this.prismaService.group.findMany();
  }
}
