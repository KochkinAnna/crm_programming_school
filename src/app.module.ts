import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { CommentController } from './comment/comment.controller';
import { CommentModule } from './comment/comment.module';
import { CommentService } from './comment/comment.service';
import { GroupController } from './group/group.controller';
import { GroupModule } from './group/group.module';
import { GroupService } from './group/group.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordModule } from './password/password.module';
import { PasswordService } from './password/password.service';
import { OrderController } from './order/order.controller';
import { OrderModule } from './order/order.module';
import { OrderService } from './order/order.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    AuthModule,
    CommentModule,
    GroupModule,
    OrderModule,
    PasswordModule,
    UserModule,
  ],
  controllers: [
    AppController,
    AuthController,
    CommentController,
    GroupController,
    OrderController,
    UserController,
  ],
  providers: [
    AppService,
    AuthService,
    CommentService,
    GroupService,
    JwtService,
    OrderService,
    PasswordService,
    UserService,
  ],
})
export class AppModule {}
