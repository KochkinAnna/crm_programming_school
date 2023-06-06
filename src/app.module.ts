import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { OrderModule } from './order/order.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { GroupController } from './group/group.controller';
import { GroupService } from './group/group.service';
import { GroupModule } from './group/group.module';
import { PasswordService } from './password/password.service';
import { PasswordModule } from './password/password.module';
import { JwtService } from '@nestjs/jwt';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    AuthModule,
    OrderModule,
    UserModule,
    GroupModule,
    PasswordModule,
    CommentModule,
  ],
  controllers: [
    AppController,
    AuthController,
    OrderController,
    UserController,
    GroupController,
    CommentController,
  ],
  providers: [
    AppService,
    AuthService,
    OrderService,
    UserService,
    GroupService,
    PasswordService,
    JwtService,
    CommentService,
  ],
})
export class AppModule {}
