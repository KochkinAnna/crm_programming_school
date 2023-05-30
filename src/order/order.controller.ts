import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { PaginatedOrders } from '../common/interface/paginatedOrders.interface';
import { paginatedOrdersResponse } from '../common/swagger-helper/swagger.responses';

@Controller('orders')
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated orders' })
  @ApiQuery({ name: 'page', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, example: 25 })
  @ApiQuery({ name: 'sort', enum: ['asc', 'desc'], example: 'desc' })
  @ApiOkResponse({
    schema: paginatedOrdersResponse,
  })
  async getPaginatedOrders(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sort') sort: 'asc' | 'desc',
  ): Promise<PaginatedOrders> {
    page = page ? +page : 1;
    limit = limit ? +limit : 25;
    sort = sort === 'asc' ? 'asc' : 'desc';

    return await this.orderService.getPaginatedOrders(page, limit, sort);
  }
}
