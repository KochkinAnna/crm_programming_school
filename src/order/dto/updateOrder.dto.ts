import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ECourseFormat } from '../../common/enum/course-format.enum';
import { ECourseType } from '../../common/enum/course-type.enum';
import { ECourse } from '../../common/enum/course.enum';
import { EStatus } from '../../common/enum/status.enum';

export class CreateOrderDto {
  @ApiPropertyOptional({
    name: 'name',
    required: false,
    example: 'Tom',
    description: "Student's name",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    name: 'surname',
    required: false,
    example: 'Ford',
    description: "Student's surname",
  })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiPropertyOptional({
    name: 'email',
    required: false,
    example: 'studend@gmail.com',
    description: "Student's email",
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    name: 'phone',
    required: false,
    example: '+380500554417',
    description: "Student's phone",
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    name: 'age',
    required: false,
    example: '24',
    description: "Student's age",
  })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({
    name: 'course',
    required: false,
    enum: ECourse,
    description: 'Course',
  })
  @IsOptional()
  @IsString()
  course?: ECourse;

  @ApiPropertyOptional({
    name: 'courseFormat',
    required: false,
    enum: ECourseFormat,
    description: 'Format of course',
  })
  @IsOptional()
  @IsString()
  courseFormat?: ECourseFormat;

  @ApiPropertyOptional({
    name: 'courseType',
    required: false,
    enum: ECourseType,
    description: 'Type of course',
  })
  @IsOptional()
  @IsString()
  courseType?: ECourseType;

  @ApiPropertyOptional({
    name: 'sum',
    required: false,
    example: '10000',
    description: 'The amount to be paid',
  })
  @IsOptional()
  @IsNumber()
  sum?: number;

  @ApiPropertyOptional({
    name: 'alreadyPaid',
    required: false,
    example: '5000',
    description: 'The amount that has already been paid',
  })
  @IsOptional()
  @IsNumber()
  alreadyPaid?: number;

  @ApiPropertyOptional({
    name: 'createdAt',
    required: false,
    description: 'When the application is created',
  })
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional({
    name: 'utm',
    required: false,
    example: 'example-utm',
  })
  @IsOptional()
  @IsString()
  utm?: string;

  @ApiPropertyOptional({
    name: 'msg',
    required: false,
    example: 'example-msg',
    description:
      'Comments. Comments can be entered only in those requests that do not have a manager',
  })
  @IsOptional()
  @IsString()
  msg?: string;

  @ApiPropertyOptional({
    name: 'status',
    required: false,
    enum: EStatus,
    description: 'Status of application',
  })
  @IsOptional()
  @IsString()
  status?: EStatus;

  @ApiPropertyOptional({ name: 'manager_id' })
  @IsNumber()
  @IsOptional()
  managerId?: number;
}
