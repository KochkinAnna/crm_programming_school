import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiPropertyOptional({
    name: 'name',
    required: false,
    example: 'september-2022',
    description: 'The name of group',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
