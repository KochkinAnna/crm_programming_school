import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { AuthGuard } from '@nestjs/passport';
import { Order } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPaginatedOrders(
    page = 1,
    limit = 25,
    sort: 'asc' | 'desc' = 'desc',
    sortBy: keyof Order = 'id',
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
}
