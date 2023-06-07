import { Controller, Get, Query, UseGuards } from "@nestjs/common";
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
import { ESortBy } from '../common/enum/sortBy.enum';
import { JwtAuthGuard } from "../auth/strategy/jwt-auth.guard";

@Controller('order')
@ApiTags('Order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated orders' })
  @ApiQuery({ name: 'page', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, example: 25 })
  @ApiQuery({ name: 'sort', enum: ['asc', 'desc'], example: 'desc' })
  @ApiQuery({
    name: 'sortBy',
    enum: Object.values(ESortBy),
    example: ESortBy.Id,
  })
  @ApiOkResponse({
    schema: paginatedOrdersResponse,
  })
  @UseGuards(JwtAuthGuard)
  async getPaginatedOrders(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sort') sort: 'asc' | 'desc',
    @Query('sortBy') sortBy: SortBy,
  ): Promise<IPaginatedOrders> {
    page = page ? +page : 1;
    limit = limit ? +limit : 25;
    sort = sort === 'asc' ? 'asc' : 'desc';

    return await this.orderService.getPaginatedOrders(
      page,
      limit,
      sort,
      sortBy,
    );
  }
}
