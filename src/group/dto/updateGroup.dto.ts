import { IsNotEmpty, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiPropertyOptional({
    name: 'name',
    required: false,
    example: 'september-2023',
    description: 'The name of group',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}