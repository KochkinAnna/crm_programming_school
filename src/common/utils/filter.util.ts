export class FilterUtil {
  static generateWhereFilter(filter: string) {
    const [field, ...conditions] = filter.split(':');

    const filterObject: any = {};

    if (conditions.length === 1) {
      const value = conditions[0].toLowerCase();
      filterObject[field] = { contains: value };
    } else if (conditions.length === 2) {
      const [operator, value] = conditions;
      if (FilterUtil.isNumericField(field)) {
        switch (operator) {
          case 'eq':
            filterObject[field] = parseInt(value, 10);
            break;
          case 'neq':
            filterObject[field] = { not: parseInt(value, 10) };
            break;
          case 'gt':
            filterObject[field] = { gt: parseInt(value, 10) };
            break;
          case 'lt':
            filterObject[field] = { lt: parseInt(value, 10) };
            break;
          case 'gte':
            filterObject[field] = { gte: parseInt(value, 10) };
            break;
          case 'lte':
            filterObject[field] = { lte: parseInt(value, 10) };
            break;
          default:
            throw new Error(`Invalid operator '${operator}' for numeric field`);
        }
      } else {
        filterObject[field] = { contains: value };
      }
    }

    return filterObject;
  }

  static isNumericField(field: string) {
    return ['id', 'age', 'sum', 'alreadyPaid'].includes(field);
  }
}
