import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/orm/prisma.service';
import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { Order } from '@prisma/client';

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
        where: filter ? this.generateWhereFilter(filter) : undefined,
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

  private generateWhereFilter(filter: string) {
    const [field, ...conditions] = filter.split(':');

    const filterObject: any = {};

    if (conditions.length === 1) {
      filterObject[field] = conditions[0];
    } else if (conditions.length === 2) {
      const [operator, value] = conditions;
      if (this.isNumericField(field)) {
        switch (operator) {
          case 'eq':
            filterObject[field] = parseInt(value, 10);
            break;
          case 'neq':
            filterObject[field] = { not: parseInt(value, 10) };
            break;
          case 'gt':
            filterObject[field] = { gt: parseInt(value, 10) };
            break;
          case 'lt':
            filterObject[field] = { lt: parseInt(value, 10) };
            break;
          case 'gte':
            filterObject[field] = { gte: parseInt(value, 10) };
            break;
          case 'lte':
            filterObject[field] = { lte: parseInt(value, 10) };
            break;
        }
      } else {
        if (operator === 'like') {
          filterObject[field] = { contains: value };
        } else {
          filterObject[field] = { [operator]: value };
        }
      }
    }

    if (this.isTextField(field)) {
      filterObject[field] = {
        contains: conditions[0],
      };
    }

    return filterObject;
  }

  private isNumericField(field: string) {
    return ['age', 'sum', 'alreadyPaid'].includes(field);
  }

  private isTextField(field: string) {
    const lowercaseField = field.toLowerCase();
    return lowercaseField === field.toLowerCase();
  }
}
