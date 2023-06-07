import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { Group } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async createGroup(name: string): Promise<Group> {
    return this.prismaService.group.create({
      data: { name },
    });
  }
}
