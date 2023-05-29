import { Order } from '@prisma/client';

export interface PaginatedOrders {
  page: number;
  limit: number;
  total: number;
  data: Order[];
}
