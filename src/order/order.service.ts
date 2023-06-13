import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { Order } from '@prisma/client';
import { FilterUtil } from '../common/utils/filter.util';

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
        include: { manager: true },
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
      include: { group: true, manager: true },
    });
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
    const order = await this.prismaService.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: { group: true, manager: true },
    });

    if (order && !order.manager) {
      return this.prismaService.order.update({
        where: { id: parseInt(id, 10) },
        data,
        include: { group: true, manager: true },
      });
    } else {
      throw new Error('Cannot update order with an assigned manager.');
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.prismaService.order.findMany({
      where: { managerId: parseInt(userId, 10) },
      include: { manager: true },
    });
  }
}
