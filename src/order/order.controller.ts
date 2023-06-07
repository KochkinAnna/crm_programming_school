import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
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
import { SortBy } from '../common/type/sortBy.type';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { Order } from '@prisma/client';
import { PaginationQuery } from '../common/swagger-helper/paginationQuery.apidecorator';

@Controller('order')
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
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sort') sort: 'asc' | 'desc',
    @Query('sortBy') sortBy: SortBy,
    @Query('filter') filter: string,
  ): Promise<IPaginatedOrders> {
    page = page ? +page : 1;
    limit = limit ? +limit : 25;
    sort = sort === 'asc' ? 'asc' : 'desc';

    return await this.orderService.getPaginatedOrders(
      page,
      limit,
      sort,
      sortBy,
      filter,
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
  ): Promise<Order | null> {
    return await this.orderService.updateOrder(id, data);
  }
}
