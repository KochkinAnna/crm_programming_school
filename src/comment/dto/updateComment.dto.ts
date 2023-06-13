import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiPropertyOptional({
    description: 'Text of the comment',
    example: 'This is an updated comment',
  })
  @IsOptional()
  @IsString()
  text?: string;

}
