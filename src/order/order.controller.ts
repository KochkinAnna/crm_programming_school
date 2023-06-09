import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import * as ExcelJS from 'exceljs';
import { Response } from 'express';

import { Order, Role, User } from '@prisma/client';

import { OrderService } from './order.service';
import { PrismaService } from '../common/orm/prisma.service';

import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { paginatedOrdersResponse } from '../common/swagger-helper/swagger.responses';
import { PaginationQuery } from '../common/swagger-helper/paginationQuery.apidecorator';
import { ExcelUtil } from '../common/utils/excel.util';
import { getOrderRow } from '../common/utils/excel.getOrderRow. util';
import { ExcelColumnHeaders } from '../common/constants/excel.constants';

@Controller('orders')
@ApiTags('Order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated orders' })
  @PaginationQuery()
  @ApiOkResponse({
    schema: paginatedOrdersResponse,
  })
  @UseGuards(JwtAuthGuard)
  async getPaginatedOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<IPaginatedOrders> {
    // Normalize and validate the query parameters
    // Нормалізація та перевірка параметрів запиту
    const normalizedPage: number = +page || 1;
    const normalizedLimit: number = +limit || 25;
    const normalizedSort: string = sort || '-id';

    let sortField: keyof Order | undefined;
    let sortOrder: 'desc' | 'asc' = 'desc';

    if (normalizedSort.startsWith('-')) {
      const field = normalizedSort.substring(1);
      sortField = field as keyof Order;
      sortOrder = 'desc';
    } else if (normalizedSort.includes(':')) {
      const [field, direction] = normalizedSort.split(':');
      sortField = field as keyof Order;
      sortOrder = direction as 'desc' | 'asc';
    } else {
      sortField = normalizedSort as keyof Order;
      sortOrder = 'asc';
    }

    // Call the order service to get the paginated orders
    // Виклик сервісу замовлень для отримання пагінованого списку замовлень
    return await this.orderService.getPaginatedOrders(
      normalizedPage,
      normalizedLimit,
      sortOrder,
      sortField,
      filter ? filter.split(',') : undefined,
      startDate,
      endDate,
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiQuery({ name: 'userId', type: Number, example: 1 })
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Param('userId') userId: string): Promise<Order[]> {
    return await this.orderService.getUserOrders(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiQuery({ name: 'id', type: Number, example: 1 })
  @UseGuards(JwtAuthGuard)
  async updateOrder(
    @Param('id') id: string,
    @Body() data: Partial<Order>,
    @Req() req,
  ): Promise<Order | null> {
    try {
      const user: User = req.user;

      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }

      const updatedOrder = await this.orderService.updateOrder(id, data, user);
      if (updatedOrder) {
        return updatedOrder;
      } else {
        throw new NotFoundException('Order not found');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/statistics')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiCreatedResponse({ description: 'Order statistics' })
  @UseGuards(JwtAuthGuard)
  async getOrderStatistics(@Req() req): Promise<any> {
    const user: User = req.user;

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can access order statistics');
    }

    return this.orderService.getOrderStatistics();
  }

  @Get('/statistics/user/:userId')
  @ApiOperation({ summary: 'Get order statistics by user ID' })
  @ApiCreatedResponse({ description: 'Order statistics' })
  @UseGuards(JwtAuthGuard)
  async getOrderStatisticsByUser(
    @Param('userId') userId: string,
    @Req() req,
  ): Promise<any> {
    const parsedUserId = parseInt(userId);

    const user: User = req.user;

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can access order statistics');
    }

    return this.orderService.getOrderStatisticsByUser(parsedUserId);
  }

  @Get('/excel')
  @ApiOperation({ summary: 'Get orders as Excel file' })
  @UseGuards(JwtAuthGuard)
  async getOrdersExcel(
    @Res() res: Response,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<void> {
    // Get paginated orders
    // Отримання розподіленого списку замовлень
    const orders = await this.getPaginatedOrders(
      page,
      limit,
      sort,
      filter,
      startDate,
      endDate,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    const headers = [
      ExcelColumnHeaders.ID,
      ExcelColumnHeaders.Name,
      ExcelColumnHeaders.Surname,
      ExcelColumnHeaders.Email,
      ExcelColumnHeaders.Phone,
      ExcelColumnHeaders.Age,
      ExcelColumnHeaders.Course,
      ExcelColumnHeaders.CourseFormat,
      ExcelColumnHeaders.CourseType,
      ExcelColumnHeaders.Status,
      ExcelColumnHeaders.Sum,
      ExcelColumnHeaders.AlreadyPaid,
      ExcelColumnHeaders.Group,
      ExcelColumnHeaders.CreatedAt,
      ExcelColumnHeaders.UTM,
      ExcelColumnHeaders.Message,
      ExcelColumnHeaders.Manager,
      ExcelColumnHeaders.Comment,
    ];

    // Add headers to the worksheet
    // Додавання заголовків до аркуша
    ExcelUtil.addHeaderRow(worksheet, headers);

    // Iterate over each order and add it as a row in the worksheet
    // Перебір кожного замовлення та додавання його як рядка в аркуш
    for (const order of orders.data) {
      const group = order.groupId
        ? await this.prismaService.group.findUnique({
            where: {
              id: order.groupId,
            },
          })
        : undefined;

      const manager = order.managerId
        ? await this.prismaService.user.findUnique({
            where: {
              id: order.managerId,
            },
          })
        : undefined;

      const comments = await this.prismaService.comment.findMany({
        where: {
          orderId: order.id,
        },
      });

      const orderRow = getOrderRow(order, group, manager, comments);
      worksheet.addRow(orderRow);
    }

    // Apply styles to the worksheet
    // Застосування стилів до аркуша
    ExcelUtil.applyStyles(worksheet);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

    // Write the workbook to the response as an Excel file
    // Запис робочої книги в відповідь як файл Excel
    await workbook.xlsx.write(res);
    res.end();
  }
}
