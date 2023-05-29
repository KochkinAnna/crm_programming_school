import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../common/orm/prisma.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../common/orm/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
