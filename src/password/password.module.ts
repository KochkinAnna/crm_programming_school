import { PasswordService } from './password.service';
import { PrismaService } from '../common/orm/prisma.service';
import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../common/orm/prisma.module';

@Module({
  imports: [PrismaModule, forwardRef(() => UserModule)],
  providers: [PrismaService, PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
