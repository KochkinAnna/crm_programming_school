import { Group, Order, User, Comment } from '@prisma/client';

export function getOrderRow(
  order: Order,
  group: Group | undefined,
  manager: User | undefined,
  comments: Comment[],
): any[] {
  const {
    id,
    name,
    surname,
    email,
    phone,
    age,
    course,
    course_format,
    course_type,
    status,
    sum,
    alreadyPaid,
    created_at,
    utm,
    msg,
  } = order;

  return [
    id,
    name,
    surname,
    email,
    phone,
    age,
    course,
    course_format,
    course_type,
    status,
    sum,
    alreadyPaid,
    group?.name,
    created_at,
    utm,
    msg,
    manager?.lastName,
    comments.map((comment) => comment.text).join('\n'),
  ];
}
