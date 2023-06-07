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
        }
      } else {
        if (operator === 'like') {
          filterObject[field] = { contains: value };
        } else {
          filterObject[field] = { [operator]: value };
        }
      }
    }

    if (FilterUtil.isTextField(field)) {
      filterObject[field] = {
        contains: conditions[0],
      };
    }

    return filterObject;
  }

  static isNumericField(field: string) {
    return ['age', 'sum', 'alreadyPaid'].includes(field);
  }

  static isTextField(field: string) {
    const lowercaseField = field.toLowerCase();
    return lowercaseField === field.toLowerCase();
  }
}
