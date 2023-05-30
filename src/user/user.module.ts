import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../common/orm/prisma.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../common/orm/prisma.module';
import { PasswordModule } from '../password/password.module';
import { PasswordService } from '../password/password.service';

@Module({
  imports: [PrismaModule, forwardRef(() => PasswordModule)],
  controllers: [UserController],
  providers: [UserService, PrismaService, PasswordService],
  exports: [UserService],
})
export class UserModule {}
