export const paginatedOrdersResponse = {
  properties: {
    page: { type: 'number' },
    limit: { type: 'number' },
    total: { type: 'number' },
    data: {
      type: 'array',
      example: [
        {
          id: 498,
          name: 'Jhon',
          surname: 'Sur',
          email: 'good@gmail.com',
          phone: '380393098298',
          age: 55,
          course: 'PCX',
          course_format: 'online',
          course_type: 'incubator',
          status: null,
          sum: null,
          alreadyPaid: null,
          groupId: null,
          created_at: '2022-06-02T11:02:23.000Z',
          utm: '',
          msg: '',
          managerId: null,
        },
      ],
    },
  },
};
