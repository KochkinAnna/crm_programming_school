import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ERole } from '../../common/enum/role.enum';

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
  password?: string;

  @ApiPropertyOptional({ name: 'role', enum: ERole })
  @IsString()
  @IsOptional()
  role: ERole;

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
