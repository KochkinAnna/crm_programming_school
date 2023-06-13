import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { Order } from '@prisma/client';
import { FilterUtil } from '../common/utils/filter.util';
import { orderIncludes } from '../common/prisma-helper/prisma.includes';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPaginatedOrders(
    page = 1,
    limit = 25,
    sort: 'asc' | 'desc' = 'desc',
    sortField: keyof Order = 'id',
    filter?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<IPaginatedOrders> {
    const skip = (page - 1) * limit;

    const orderBy = {
      [sortField]: sort,
    };

    const where = filter ? FilterUtil.generateWhereFilter(filter) : {};

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [data, total] = await Promise.all([
      this.prismaService.order.findMany({
        take: limit,
        skip,
        orderBy,
        where,
        include: {
          group: true,
          manager: orderIncludes.manager,
        },
      }),
      this.prismaService.order.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      data,
    };
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.prismaService.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        group: true,
        manager: orderIncludes.manager,
      },
    });
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
    const { groupId, managerId } = data;

    const order = await this.prismaService.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        group: true,
        manager: orderIncludes.manager,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.managerId) {
      throw new Error('Cannot update order with an assigned manager.');
    }

    if (groupId !== undefined) {
      if (groupId === null) {
        return this.prismaService.order.update({
          where: { id: parseInt(id, 10) },
          data: { group: { disconnect: true } },
          include: {
            group: true,
            manager: orderIncludes.manager,
          },
        });
      }

      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new Error('Invalid groupId');
      }

      return this.prismaService.order.update({
        where: { id: parseInt(id, 10) },
        data: { group: { connect: { id: groupId } } },
        include: {
          group: true,
          manager: orderIncludes.manager,
        },
      });
    }

    if (managerId !== undefined) {
      if (managerId === null) {
        return this.prismaService.order.update({
          where: { id: parseInt(id, 10) },
          data: { manager: { disconnect: true } },
          include: {
            group: true,
            manager: orderIncludes.manager,
          },
        });
      }

      const manager = await this.prismaService.user.findUnique({
        where: { id: managerId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      });

      if (!manager) {
        throw new Error('Invalid managerId');
      }

      return this.prismaService.order.update({
        where: { id: parseInt(id, 10) },
        data: { manager: { connect: { id: managerId } } },
        include: {
          group: true,
          manager: orderIncludes.manager,
        },
      });
    }

    throw new Error('Invalid update data');
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.prismaService.order.findMany({
      where: { managerId: parseInt(userId, 10) },
      include: {
        group: true,
        manager: orderIncludes.manager,
      },
    });
  }
}
