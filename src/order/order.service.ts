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
    console.log('Before findMany:', filter);
    const [data, total] = await Promise.all([
      this.prismaService.order.findMany({
        take: limit,
        skip,
        orderBy,
        where: filter ? FilterUtil.generateWhereFilter(filter) : undefined,
      }),
      this.prismaService.order.count(),
    ]);

    console.log('getPaginatedOrders:', data);
    console.log('Total orders:', total);

    return {
      page,
      limit,
      total,
      data,
    };
  }

  async getOrderById(id: string): Promise<Order | null> {
    console.log('getOrderById - ID:', id);
    return this.prismaService.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: { group: true, manager: true },
    });
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
    console.log('updateOrder - ID:', id);
    const order = await this.prismaService.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: { group: true, manager: true },
    });
    console.log('Order:', order);
    if (order && !order.manager) {
      console.log('Updating order:', id);
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
