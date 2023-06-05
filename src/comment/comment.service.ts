import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { CreateCommentDto } from './dto/createComment.dto';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentService {
  // constructor(private prismaService: PrismaService) {}
  //
  // async createComment(
  //   orderId: number,
  //   commentDto: CreateCommentDto,
  // ): Promise<Comment> {
  //   const order = await this.prismaService.order.findUnique({
  //     where: { id: orderId },
  //   });
  //   if (!order) {
  //     throw new NotFoundException('Order not found');
  //   }
  //
  //   return await this.prismaService.comment.create({
  //     data: {
  //       text: commentDto.text,
  //       author: commentDto.author,
  //       orderId: orderId,
  //     },
  //   });
  // }
  //
  // async getCommentsByOrderId(orderId: number): Promise<Comment[]> {
  //   return await this.prismaService.comment.findMany({
  //     where: {
  //       orderId,
  //     },
  //   });
  // }
}
