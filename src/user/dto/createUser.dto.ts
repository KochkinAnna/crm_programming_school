import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
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

  @ApiPropertyOptional({
    name: 'password',
    required: false,
    example: 'admin',
    description: 'User password',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    name: 'firstName',
    required: false,
    example: 'Kokos',
    description: 'User first name',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    name: 'lastName',
    required: false,
    example: 'Adminych',
    description: 'User last name',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ name: 'role', enum: Role })
  @IsString()
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    name: 'phone',
    required: false,
    example: '+380500554417',
    description: 'User phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
