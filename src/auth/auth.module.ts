import { forwardRef, Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PrismaModule } from '../common/orm/prisma.module';
import { PrismaService } from '../common/orm/prisma.service';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';

import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { jwtConstants } from './strategy/constants';
import { JwtAuthGuard } from './strategy/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60000s' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    JwtStrategy,
    LocalStrategy,
    PrismaService,
  ],
  exports: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
