import { Module } from '@nestjs/common';

import { GroupModule } from '../group/group.module';
import { GroupService } from '../group/group.service';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PasswordService } from '../password/password.service';
import { PrismaModule } from '../common/orm/prisma.module';
import { PrismaService } from '../common/orm/prisma.service';

@Module({
  imports: [PrismaModule, GroupModule],
  controllers: [OrderController],
  providers: [GroupService, PasswordService, OrderService, PrismaService],
  exports: [OrderService],
})
export class OrderModule {}
