import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../common/orm/prisma.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../common/orm/prisma.module';
import { PasswordModule } from '../password/password.module';
import { PasswordService } from '../password/password.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CommentModule } from '../comment/comment.module';
import { CommentService } from '../comment/comment.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    forwardRef(() => PasswordModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    CommentService,
    PrismaService,
    PasswordService,
    JwtService,
  ],
  exports: [UserService],
})
export class UserModule {}
