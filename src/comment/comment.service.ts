import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { Comment, Role } from '@prisma/client';
import { CreateCommentDto } from './dto/createComment.dto';
import { EStatus } from '../common/enum/status.enum';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    orderId: number,
    user,
  ) {
    if (!user.isActive && user.role !== Role.ADMIN) {
      throw new BadRequestException(
        "You have been blocked by the admin. Contact him, and don't forget to bring him a chocolate bar",
      );
    }

    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { manager: true },
    });
    if (
      order?.manager &&
      order.manager.id !== user.userId &&
      user.role === Role.MANAGER
    ) {
      throw new BadRequestException(
        'Cannot add comment to an order with an assigned manager',
      );
    }

    const commentData = {
      text: createCommentDto.text,
    };
    if (!user) {
      throw new BadRequestException('Invalid user object or missing user ID');
    }

    const orderData = {
      managerId: user.userId,
      status: order?.status ?? EStatus.IN_WORK,
    };

    const comment = await this.prismaService.comment.create({
      data: {
        ...commentData,
        order: { connect: { id: orderId } },
      },
    });
    await this.prismaService.order.update({
      where: { id: orderId },
      data: orderData,
    });
    return comment;
  }

  async getCommentsByOrderId(orderId: number): Promise<Comment[]> {
    return await this.prismaService.comment.findMany({
      where: {
        orderId,
      },
    });
  }
}
