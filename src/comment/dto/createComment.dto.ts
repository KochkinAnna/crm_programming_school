import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Text of the comment',
    example: 'This is a comment',
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Author of the comment',
    example: 'Managerovych',
  })
  @IsNotEmpty()
  @IsString()
  author: string;
}
