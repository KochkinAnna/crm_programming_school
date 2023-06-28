import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    name: 'email',
    required: true,
    example: 'admin@gmail.com',
    description: 'User(admin or manager) email address',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    name: 'password',
    required: true,
    example: 'admin',
    description: 'User password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
