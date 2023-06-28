import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CommentService } from './comment.service';

import { Comment, User } from '@prisma/client';

import { CreateCommentDto } from './dto/createComment.dto';

import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

@Controller('comments')
@ApiTags('Comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post(':orderId')
  @ApiParam({ name: 'orderId', description: 'ID of the order' })
  @ApiOperation({ summary: 'Post comment by logined user' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
  })
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Param('orderId') orderId: string,
    @Req() req,
  ) {
    const parsedOrderId = parseInt(orderId);

    if (isNaN(parsedOrderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const user: User = req.user;

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return await this.commentService.createComment(
      createCommentDto,
      parsedOrderId,
      user,
    );
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get comments by order ID' })
  @ApiParam({ name: 'orderId', description: 'ID of the order' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: [CreateCommentDto],
  })
  async getCommentsByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<Comment[]> {
    const parsedOrderId = parseInt(orderId);
    return await this.commentService.getCommentsByOrderId(parsedOrderId);
  }
}
