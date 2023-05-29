import { Controller, Get, Query } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getPaginatedOrders(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sort') sort: 'asc' | 'desc',
  ) {
    page = page ? +page : 1;
    limit = limit ? +limit : 25;
    sort = sort === 'asc' ? 'asc' : 'desc';

    return await this.orderService.getPaginatedOrders(page, limit, sort);
  }
}
