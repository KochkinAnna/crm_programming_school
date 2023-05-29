import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { PaginatedOrders } from '../common/interface/paginatedOrders.interface';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPaginatedOrders(
    page = 1,
    limit = 25,
    sort: 'asc' | 'desc' = 'desc',
  ): Promise<PaginatedOrders> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prismaService.order.findMany({
        take: limit,
        skip,
        orderBy: {
          created_at: sort === 'asc' ? 'asc' : 'desc',
        },
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
