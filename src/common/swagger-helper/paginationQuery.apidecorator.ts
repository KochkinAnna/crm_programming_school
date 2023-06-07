import { ApiQuery } from '@nestjs/swagger';
import { ESortBy } from '../enum/sortBy.enum';

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
    ApiQuery({ name: 'sort', enum: ['asc', 'desc'], example: 'desc' })(
      target,
      key,
      descriptor,
    );
    ApiQuery({
      name: 'sortBy',
      enum: Object.values(ESortBy),
      example: ESortBy.Id,
    })(target, key, descriptor);
    ApiQuery({
      name: 'filter',
      type: String,
      example: 'course:QACX',
      description: `Filter query in the format "field:value" for string fields (without space!).
    For numeric fields (such as "age", "sum" і "alreadyPaid"), use the format "field:operator:value" (example: age:eq:30).
    Operators: eq (equals), neq (not equals), gt (greater than),
    lt (less than), gte (greater than or equal to), lte (less than or equal to)"`,
    })(target, key, descriptor);
  };
}
