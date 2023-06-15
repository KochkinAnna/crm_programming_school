import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { IPaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { paginatedOrdersResponse } from '../common/swagger-helper/swagger.responses';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { Order, User } from '@prisma/client';
import { PaginationQuery } from '../common/swagger-helper/paginationQuery.apidecorator';

@Controller('orders')
@ApiTags('Order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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
}
