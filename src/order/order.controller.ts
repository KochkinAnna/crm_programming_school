import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { PaginatedOrders } from '../common/interface/paginatedOrders.interface';

class PaginatedOrdersResponse {
  constructor(public readonly data: PaginatedOrders) {} //The @ApiResponse decorator uses this wrapper class instead of directly using the PaginatedOrders interface (since it is used as a value, not a type) / (Декоратор @ApiResponse  використовує цей клас-обгортку замість безпосереднього використання інтерфейсу PaginatedOrders (оскільки він використовується як значення, а не тип))
}

@Controller('orders')
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated orders' })
  @ApiQuery({ name: 'page', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, example: 25 })
  @ApiQuery({ name: 'sort', enum: ['asc', 'desc'], example: 'desc' })
  @ApiResponse({ status: 200, type: PaginatedOrdersResponse })
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
