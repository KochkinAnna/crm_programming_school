import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

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
  @ApiQuery({
    name: 'filter',
    type: String,
    example: 'course:QACX',
    description: `Filter query in the format "field:value" for string fields (without space!).
    For numeric fields (such as "age", "sum" і "alreadyPaid"), use the format "field:operator:value" (example: age:eq:30).
    Operators: eq (equals), neq (not equals), gt (greater than),
    lt (less than), gte (greater than or equal to), lte (less than or equal to)"`,
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
}
