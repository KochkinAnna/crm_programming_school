export class FilterUtil {
  static generateWhereFilter(filter: string) {
    const [field, ...conditions] = filter.split(':');

    const filterObject: any = {};

    if (conditions.length === 1) {
      filterObject[field] = conditions[0];
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
            filterObject[field] = { contains: value.toLowerCase() };
            break;
        }
      } else {
        if (operator === 'like') {
          filterObject[field] = { contains: value.toLowerCase() };
        } else {
          filterObject[field] = { [operator]: value };
        }
      }
    }

    return filterObject;
  }

  static isNumericField(field: string) {
    return ['id', 'age', 'sum', 'alreadyPaid'].includes(field);
  }
}
