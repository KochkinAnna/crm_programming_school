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

@Module({
  imports: [AuthModule, OrderModule, UserModule, GroupModule],
  controllers: [
    AppController,
    AuthController,
    OrderController,
    UserController,
    GroupController,
  ],
  providers: [AppService, AuthService, OrderService, UserService, GroupService],
})
export class AppModule {}
