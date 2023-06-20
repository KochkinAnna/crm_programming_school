import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { Order, Prisma, Role } from '@prisma/client';
import { orderIncludes } from '../common/prisma-helper/prisma.includes';
import { EStatus } from '../common/enum/status.enum';
import { FilterUtil } from '../common/utils/filter.util';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPaginatedOrders(
    page = 1,
    limit = 25,
    sort: 'desc' | 'asc' = 'desc',
    sortField: keyof Order = 'id',
    filter?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<IPaginatedOrders> {
    const skip = (page - 1) * limit;

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};

    if (sortField) {
      orderBy[sortField] = sort;
    }

    const where: Prisma.OrderWhereInput = {};

    if (filter) {
      const filterObject = FilterUtil.generateWhereFilter(filter);
      Object.assign(where, filterObject);
    }

    where.created_at = {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    };

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
    if (!user.isActive && user.role !== Role.ADMIN) {
      throw new BadRequestException(
        "You have been blocked by the admin. Contact him, and don't forget to bring him a chocolate bar",
      );
    }

    const order = await this.prismaService.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: { group: true, manager: orderIncludes.manager },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      user.role === Role.MANAGER &&
      order.managerId !== user.userId &&
      order.managerId !== null
    ) {
      throw new UnauthorizedException(
        "You are not allowed to update this order. It's order of another manager.",
      );
    }

    const updateParams = this.buildUpdateParams(data);

    updateParams.manager = { connect: { id: user.userId } };
    updateParams.status = EStatus.IN_WORK;

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
