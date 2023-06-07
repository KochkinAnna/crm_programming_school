import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/orm/prisma.module';
import { PrismaService } from '../common/orm/prisma.service';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { GroupModule } from '../group/group.module';
import { GroupService } from '../group/group.service';

@Module({
  imports: [PrismaModule, GroupModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, GroupService],
  exports: [OrderService],
})
export class OrderModule {}
