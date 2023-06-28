import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../common/orm/prisma.service';

import { Comment } from '@prisma/client';
import { CreateCommentDto } from './dto/createComment.dto';
import { EStatus } from '../common/enum/status.enum';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  // Creates a comment for a specific order
  // Створення коментаря для певного замовлення
  async createComment(
    createCommentDto: CreateCommentDto,
    orderId: number,
    user,
  ) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { manager: true },
    });

    // Validate user object and user ID
    // Перевірка об'єкта користувача та ідентифікатора користувача
    if (!user || !user.userId) {
      throw new BadRequestException('Invalid user object or missing user ID');
    }

    // Check if the order has an assigned manager and the user is not the manager
    // Перевірка, чи має замовлення призначеного менеджера і чи користувач не є менеджером
    if (order?.manager && order.manager.id !== user.userId) {
      throw new BadRequestException(
        'Cannot add comment to an order with an assigned manager',
      );
    }

    // Prepare comment data
    // Підготовка даних коментаря
    const commentData = {
      text: createCommentDto.text,
      user: { connect: { id: user.userId } },
    };

    // Prepare order data
    // Підготовка даних замовлення
    const orderData: { status: string; managerId?: number } = {
      status: order?.status ?? EStatus.IN_WORK,
    };

    // If the order doesn't have a manager, assign the current user as the manager
    // Якщо у замовлення немає менеджера, призначити поточного користувача менеджером
    if (!order?.manager) {
      orderData.managerId = user.userId;
    }

    // Create the comment
    // Створення коментаря
    const comment = await this.prismaService.comment.create({
      data: {
        ...commentData,
        order: { connect: { id: orderId } },
      },
    });

    // Update the order with the new status and manager ID if applicable
    // Оновлення замовлення новим статусом та ідентифікатором менеджера (якщо це потрібно)
    await this.prismaService.order.update({
      where: { id: orderId },
      data: orderData,
    });

    return comment;
  }

  // Retrieves comments for a specific order
  // Отримання коментарів для певного замовлення
  async getCommentsByOrderId(orderId: number): Promise<Comment[]> {
    return await this.prismaService.comment.findMany({
      where: {
        orderId,
      },
    });
  }
}
