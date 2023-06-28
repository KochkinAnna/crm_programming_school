import { Module } from '@nestjs/common';

import { PrismaModule } from '../common/orm/prisma.module';
import { PrismaService } from '../common/orm/prisma.service';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GroupController],
  providers: [GroupService, PrismaService],
  exports: [GroupService],
})
export class GroupModule {}
