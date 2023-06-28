import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CommentModule } from '../comment/comment.module';
import { CommentService } from '../comment/comment.service';
import { PasswordModule } from '../password/password.module';
import { PasswordService } from '../password/password.service';
import { PrismaModule } from '../common/orm/prisma.module';
import { PrismaService } from '../common/orm/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    forwardRef(() => PasswordModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [UserController],
  providers: [
    AuthService,
    JwtService,
    CommentService,
    PasswordService,
    PrismaService,
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}
