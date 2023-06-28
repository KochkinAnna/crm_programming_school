import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';

import { JwtAuthGuard } from './strategy/jwt-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Successful login' })
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return this.authService.login(loginDto);
    } catch (error) {
      throw new BadRequestException('Invalid login data');
    }
  }

  @ApiOperation({ summary: 'Refresh Token' })
  @ApiBody({ description: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'Successful token refresh' })
  @Post('/refresh-token')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      return await this.authService.refreshToken(refreshTokenDto);
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Return the current user' })
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getCurrentUser(@Req() req) {
    return req.user;
  }
}
