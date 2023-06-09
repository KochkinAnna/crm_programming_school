import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({
    name: 'email',
    required: false,
    example: 'admin@gmail.com',
    description: 'User (admin or manager) email address',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    name: 'password',
    required: false,
    example: 'admin',
    description: 'User password',
  })
  @IsOptional()
  @IsString()
  @Length(4, 25)
  password?: string;

  @ApiPropertyOptional({ name: 'role', enum: Role })
  @IsString()
  @IsOptional()
  role: Role;

  @ApiPropertyOptional({
    name: 'firstName',
    required: false,
    example: 'Kokos',
    description: 'User first name',
  })
  @IsOptional()
  @IsString()
  @Length(2, 25)
  firstName?: string;

  @ApiPropertyOptional({
    name: 'lastName',
    required: false,
    example: 'Adminych',
    description: 'User last name',
  })
  @IsOptional()
  @IsString()
  @Length(2, 25)
  lastName?: string;

  @ApiPropertyOptional({
    name: 'phone',
    required: false,
    example: '+380500554417',
    description: 'User phone number',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string;
}
