import { ApiQuery } from '@nestjs/swagger';

export function PaginationQuery(): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    ApiQuery({ name: 'page', type: Number, example: 1 })(
      target,
      key,
      descriptor,
    );
    ApiQuery({ name: 'limit', type: Number, example: 25 })(
      target,
      key,
      descriptor,
    );
    ApiQuery({
      name: 'sort',
      example: 'name - this is asc, -name - this is desc',
    })(target, key, descriptor);
    ApiQuery({
      name: 'filter',
      type: String,
      example: 'course:QACX',
      description: `
   *    Filter query in the format "field:value" for string fields (without space!).
   *    For partial string matching, use the format "field:like:value" (example: name:like:ho to receive orders with the order's name, for example Jhon).
   *    For numeric fields (such as "id", "age", "sum", and "alreadyPaid"), use the format "field:operator:value" (example: age:eq:30 or id:eq:1).<p>Operators: eq (equals), neq (not equals), gt (greater than), lt (less than), gte (greater than or equal to), lte (less than or equal to).</p>`,
    })(target, key, descriptor);
    ApiQuery({
      name: 'startDate',
      type: String,
      example: '2023-01-01',
      required: false,
    })(target, key, descriptor);
    ApiQuery({
      name: 'endDate',
      type: String,
      example: '2023-05-31',
      required: false,
    })(target, key, descriptor);
  };
}
