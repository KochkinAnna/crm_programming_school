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
import { OrderService } from './order.service';
import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { paginatedOrdersResponse } from '../common/swagger-helper/swagger.responses';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { Order, Role, User } from '@prisma/client';
import { PaginationQuery } from '../common/swagger-helper/paginationQuery.apidecorator';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { ExcelUtil } from '../common/utils/excel.util';
import { PrismaService } from '../common/orm/prisma.service';

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

    return await this.orderService.getPaginatedOrders(
      normalizedPage,
      normalizedLimit,
      sortOrder,
      sortField,
      filter,
      startDate,
      endDate,
    );
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

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiQuery({ name: 'userId', type: Number, example: 1 })
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Param('userId') userId: string): Promise<Order[]> {
    return await this.orderService.getUserOrders(userId);
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

  @Get('/excel')
  @ApiOperation({ summary: 'Get orders as Excel file' })
  // @UseGuards(JwtAuthGuard)
  async getOrdersExcel(
    @Res() res: Response,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<void> {
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
      'ID',
      'Name',
      'Surname',
      'Email',
      'Phone',
      'Age',
      'Course',
      'Course Format',
      'Course Type',
      'Status',
      'Sum',
      'Already Paid',
      'Group',
      'Created At',
      'UTM',
      'Message',
      'Manager',
      'Comment',
    ];

    ExcelUtil.addHeaderRow(worksheet, headers);

    for (const order of orders.data) {
      const {
        id,
        name,
        surname,
        email,
        phone,
        age,
        course,
        course_format,
        course_type,
        status,
        sum,
        alreadyPaid,
        groupId,
        created_at,
        utm,
        msg,
        managerId,
      } = order;

      const group = groupId
        ? await this.prismaService.group.findUnique({
            where: {
              id: groupId,
            },
          })
        : undefined;
      const manager = managerId
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

      worksheet.addRow([
        id,
        name,
        surname,
        email,
        phone,
        age,
        course,
        course_format,
        course_type,
        status,
        sum,
        alreadyPaid,
        group?.name,
        created_at,
        utm,
        msg,
        manager?.lastName,
        comments.map((comment) => comment.text).join('\n'),
      ]);
    }

    ExcelUtil.applyStyles(worksheet);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }
}
