import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { Comment, Role, User } from '@prisma/client';
import { CreateCommentDto } from './dto/createComment.dto';
import { EStatus } from '../common/enum/status.enum';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    orderId: number,
    user: User,
  ) {
    console.log(user);
    if (user.role !== Role.ADMIN && user.role !== Role.MANAGER) {
      throw new ForbiddenException(
        'User does not have permission to create a comment',
      );
    }

    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { manager: true },
    });
    console.log(order);
    if (order?.manager) {
      throw new BadRequestException(
        'Cannot add comment to an order with an assigned manager',
      );
    }

    const commentData = {
      text: createCommentDto.text,
      author: createCommentDto.author,
    };
    console.log(user.id);
    if (!user || !user.id) {
      throw new BadRequestException('Invalid user object or missing user ID');
    }

    const orderData = {
      managerId: user.id,
      status: EStatus.IN_WORK,
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
