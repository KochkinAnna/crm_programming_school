import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { Comment } from '@prisma/client';
import { CreateCommentDto } from './dto/createComment.dto';

@Controller('comment')
@ApiTags('Comments')
export class CommentController {
  // constructor(private commentService: CommentService) {
  // }
  //
  // @Post(':orderId')
  // @ApiParam({ name: 'orderId', description: 'ID of the order' })
  // @ApiBody({ type: CreateCommentDto })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Comment created successfully',
  //   // type: Comment,
  // })
  // async createComment(
  //   @Param('orderId') orderId: number,
  //   @Body() commentDto: CreateCommentDto,
  // ): Promise<Comment> {
  //   try {
  //     return await this.commentService.createComment(orderId, commentDto);
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException('Order not found');
  //     }
  //     throw error;
  //   }
  // }
  //
  // @Get(':orderId')
  // @ApiOperation({ summary: 'Get comments by order ID' })
  // @ApiParam({ name: 'orderId', description: 'ID of the order' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Comments retrieved successfully',
  //   // type: [Comment],
  // })
  // async getCommentsByOrderId(
  //   @Param('orderId') orderId: number,
  // ): Promise<Comment[]> {
  //   return await this.commentService.getCommentsByOrderId(orderId);
  // }
}
