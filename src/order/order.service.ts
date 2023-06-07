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
    sortBy: keyof Order = 'id',
    filter?: string,
  ): Promise<IPaginatedOrders> {
    const skip = (page - 1) * limit;

    const orderBy = {
      [sortBy]: sort === 'asc' ? 'asc' : 'desc',
    };

    const [data, total] = await Promise.all([
      this.prismaService.order.findMany({
        take: limit,
        skip,
        orderBy,
        where: filter ? FilterUtil.generateWhereFilter(filter) : undefined,
      }),
      this.prismaService.order.count(),
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
      include: { group: true },
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
}
