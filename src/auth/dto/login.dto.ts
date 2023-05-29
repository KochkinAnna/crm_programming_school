import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '../../common/enum/role.enum';

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

  @ApiProperty({ name: 'role', enum: ERole })
  @IsString()
  @IsNotEmpty()
  role: ERole;

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
