import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ERole } from '../../common/enum/role.enum';

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

  @ApiProperty({
    name: 'password',
    required: true,
    example: 'admin',
    description: 'User password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ name: 'role', enum: ERole })
  @IsString()
  @IsNotEmpty()
  role: string;

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
