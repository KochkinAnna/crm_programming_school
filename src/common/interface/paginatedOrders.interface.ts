import { Order } from '@prisma/client';

export interface IPaginatedOrders {
  page: number;
  limit: number;
  total: number;
  data: Order[];
}
