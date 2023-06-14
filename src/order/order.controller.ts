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
import { Order, Prisma, User } from '@prisma/client';
import { PaginationQuery } from '../common/swagger-helper/paginationQuery.apidecorator';

@Controller('orders')
@ApiTags('Order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated orders' })
  @PaginationQuery()
  @ApiQuery({ name: 'sort', type: String, example: 'name', required: false })
  @ApiQuery({
    name: 'filter',
    type: String,
    example: 'course:QACX',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    example: '2023-01-01',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    example: '2023-05-31',
    required: false,
  })
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
    const normalizedPage = page ? +page : 1;
    const normalizedLimit = limit ? +limit : 25;
    const normalizedSort = sort || '-id'; // Сортувати за замовчуванням від найбільшого айді до найменшого

    const sortOrder: 'asc' | 'desc' = normalizedSort.startsWith('-')
      ? 'desc'
      : 'asc';
    const sortField: any = normalizedSort.startsWith('-')
      ? normalizedSort.substring(1)
      : 'id';

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

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiQuery({ name: 'id', type: Number, example: 1 })
  @UseGuards(JwtAuthGuard)
  async getOrderById(@Param('id') id: string): Promise<Order | null> {
    return await this.orderService.getOrderById(id);
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
