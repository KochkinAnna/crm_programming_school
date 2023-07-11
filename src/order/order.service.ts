import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Order, Prisma } from '@prisma/client';

import { PrismaService } from '../common/orm/prisma.service';

import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { orderIncludes } from '../common/prisma-helper/prisma.includes';
import { EStatus } from '../common/enum/status.enum';
import { capitalizeFirstLetter } from '../common/utils/capitalizeFirstLetter.util';
import { FilterUtil } from '../common/utils/filter.util';
import { ECourse } from '../common/enum/course.enum';
import { ECourseType } from '../common/enum/course-type.enum';
import { ECourseFormat } from '../common/enum/course-format.enum';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  // Method for getting a list of orders with pagination and filtering.
  // Метод для отримання списку замовлень з пагінацією та фільтрацією.
  async getPaginatedOrders(
    page = 1,
    limit = 25,
    sort: 'desc' | 'asc' = 'desc',
    sortField: keyof Order = 'id',
    filter?: string[],
    startDate?: string,
    endDate?: string,
  ): Promise<IPaginatedOrders> {
    const skip = (page - 1) * limit;

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};

    if (sortField) {
      orderBy[sortField] = sort;
    }

    const where: Prisma.OrderWhereInput = {};

    // Generating a filtering conditions object based on an array of filters
    // Генерація об'єкта умов фільтрації на основі масиву фільтрів
    if (filter) {
      for (const filterItem of filter) {
        const filterObject = FilterUtil.generateWhereFilter(filterItem);
        Object.assign(where, filterObject);
      }
    }

    // Filtering by order creation date
    // Фільтрація за датою створення замовлення
    where.created_at = {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    };

    // Get the list of orders and the total number of orders
    // Отримання списку замовлень та загальної кількості замовлень
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

  // Method for getting the list of orders managed by the user.
  // Метод для отримання списку замовлень, якими керує користувач.
  async getUserOrders(userId: string): Promise<Order[]> {
    return this.prismaService.order.findMany({
      where: { managerId: parseInt(userId, 10) },
      include: {
        group: true,
        manager: orderIncludes.manager,
      },
    });
  }

  // Method for updating order information.
  // Метод для оновлення інформації про замовлення.
  async updateOrder(id: string, data, user): Promise<Order | null> {
    const order = await this.prismaService.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: { group: true, manager: orderIncludes.manager },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.managerId !== user.userId && order.managerId !== null) {
      throw new UnauthorizedException(
        "You are not allowed to update this order. It's order of another manager.",
      );
    }

    const updateParams = this.buildUpdateParams(data, user);

    // Update individual parameters
    // Оновлення окремих параметрів
    if (data.hasOwnProperty('status')) {
      const status = data.status.toLowerCase();
      if (Object.values(EStatus).includes(status)) {
        if (status === EStatus.NEW) {
          updateParams.managerId = null;
        } else {
          updateParams.managerId = user.userId;
        }
        updateParams.status = status.toLowerCase();
      } else {
        throw new BadRequestException(
          `Invalid status value. You can write only such options: ${Object.values(
            EStatus,
          ).join(', ')}`,
        );
      }
    } else if (
      !data.hasOwnProperty('status') &&
      order.status !== EStatus.IN_WORK
    ) {
      updateParams.status = EStatus.IN_WORK.toLowerCase();
    }

    if (data.hasOwnProperty('course')) {
      const course = data.course.toUpperCase();
      if (!Object.values(ECourse).includes(course)) {
        throw new BadRequestException(
          `Invalid course value. You can write only such options: ${Object.values(
            ECourse,
          ).join(', ')}`,
        );
      }
      updateParams.course = course;
    }

    if (data.hasOwnProperty('course_format')) {
      const courseFormat = data.course_format.toLowerCase();
      if (!Object.values(ECourseFormat).includes(courseFormat)) {
        throw new BadRequestException(
          `Invalid course format value. You can write only such options: ${Object.values(
            ECourseFormat,
          ).join(', ')}`,
        );
      }
      updateParams.course_format = courseFormat;
    }

    if (data.hasOwnProperty('course_type')) {
      const courseType = data.course_type.toLowerCase();
      if (!Object.values(ECourseType).includes(courseType)) {
        throw new BadRequestException(
          `Invalid course type value. You can write only such options: ${Object.values(
            ECourseType,
          ).join(', ')}`,
        );
      }
      updateParams.course_type = courseType;
    }

    if (data.hasOwnProperty('email')) {
      updateParams.email = data.email.toLowerCase();
    }

    if (data.hasOwnProperty('name')) {
      updateParams.name = capitalizeFirstLetter(data.name);
    }

    if (data.hasOwnProperty('surname')) {
      updateParams.surname = capitalizeFirstLetter(data.surname);
    }

    if (data.hasOwnProperty('groupId')) {
      const groupId = parseInt(data.groupId, 10);
      if (!isNaN(groupId)) {
        const group = await this.prismaService.group.findUnique({
          where: { id: groupId },
        });
        if (!group) {
          throw new BadRequestException('Please provide an existing groupId.');
        }
        updateParams.group = {
          connect: { id: groupId },
        };
        updateParams.manager = {
          connect: { id: user.userId },
        };
      } else {
        throw new BadRequestException(
          'Invalid groupId value. Please provide a numeric value.',
        );
      }
    }

    if (data.hasOwnProperty('managerId')) {
      const managerId = parseInt(data.managerId, 10);
      if (!isNaN(managerId)) {
        const manager = await this.prismaService.user.findUnique({
          where: { id: managerId },
        });
        if (!manager) {
          throw new BadRequestException(
            'Please provide an existing managerId.',
          );
        }
        updateParams.managerId = managerId;
      } else {
        throw new BadRequestException(
          'Invalid managerId value. Please provide a numeric value.',
        );
      }
    }

    // Update order
    // Оновлення замовлення
    return this.prismaService.order.update({
      where: { id: parseInt(id, 10) },
      data: updateParams,
      include: { group: true, manager: orderIncludes.manager },
    });
  }

  // Building order update parameters
  // Побудова параметрів оновлення замовлення
  private buildUpdateParams(data, user) {
    const { groupId, ...updateData } = data;
    const updateParams = { ...updateData };

    // Setting the manager ID for the order, if there is data to update
    // Встановлення ідентифікатора менеджера для замовлення, якщо є дані для оновлення
    if (Object.keys(updateData).length > 0) {
      updateParams.managerId = user.userId;
    }

    // Setting the group for the order
    // Встановлення групи для замовлення
    if (groupId !== undefined && groupId !== null) {
      updateParams.group = { connect: { id: groupId } };
    }

    return updateParams;
  }

  // Method for getting order statistics
  // Метод для отримання статистики замовлень
  async getOrderStatistics(): Promise<any> {
    const orders = await this.prismaService.order.findMany();

    const orderCount = orders.length;
    const statusCount = {};

    // Calculating the number of orders by status
    // Обчислення кількості замовлень за статусами
    for (const order of orders) {
      let status = order.status;

      if (status === null || status === EStatus.NEW) {
        status = EStatus.NEW;
      }

      if (!statusCount[status]) {
        statusCount[status] = 0;
      }

      statusCount[status]++;
    }

    return {
      orderCount,
      statusCount,
    };
  }

  // Method for getting order statistics for a specific user
  // Метод для отримання статистики замовлень для певного користувача
  async getOrderStatisticsByUser(userId: number): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { managedOrders: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orderCount = user.managedOrders.length;
    const statusCount = {};

    // Calculating the number of orders by status
    // Обчислення кількості замовлень за статусами
    for (const order of user.managedOrders) {
      let status = order.status;

      if (status === null || status === EStatus.NEW) {
        status = EStatus.NEW;
      }

      if (!statusCount[status]) {
        statusCount[status] = 0;
      }

      statusCount[status]++;
    }

    return {
      orderCount,
      statusCount,
    };
  }
}
