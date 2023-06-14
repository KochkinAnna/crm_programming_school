import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { Order, Prisma } from '@prisma/client';
import { FilterUtil } from '../common/utils/filter.util';
import { orderIncludes } from '../common/prisma-helper/prisma.includes';
import { EStatus } from '../common/enum/status.enum';

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

    const where: Prisma.OrderWhereInput = {};

    if (filter) {
      if (filter.startsWith('id:')) {
        const orderId = parseInt(filter.substring(3), 10);
        if (!isNaN(orderId)) {
          where.id = { equals: orderId };
        }
      } else {
        where.created_at = {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        };
      }
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

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.prismaService.order.findMany({
      where: { managerId: parseInt(userId, 10) },
      include: {
        group: true,
        manager: orderIncludes.manager,
      },
    });
  }

  async updateOrder(id: string, data, user): Promise<Order | null> {
    const order = await this.prismaService.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: { group: true, manager: orderIncludes.manager },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role === 'MANAGER' && order.managerId !== user.userId) {
      throw new UnauthorizedException(
        "You are not allowed to update this order. It's order of another manager.",
      );
    }

    const updateParams = this.buildUpdateParams(data);
    return this.prismaService.order.update({
      where: { id: parseInt(id, 10) },
      data: updateParams,
      include: { group: true, manager: orderIncludes.manager },
    });
  }

  private buildUpdateParams(data) {
    const { groupId, ...updateData } = data;

    const updateParams: Prisma.OrderUpdateInput = {
      ...updateData,
      group:
        groupId !== undefined && groupId !== null
          ? { connect: { id: groupId } }
          : undefined,
    };

    if (updateData.status === EStatus.NEW) {
      updateParams.manager = { disconnect: true };
    }

    return updateParams;
  }
}
