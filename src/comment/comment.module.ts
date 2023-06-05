import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaModule } from '../common/orm/prisma.module';
import { PrismaService } from '../common/orm/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [CommentController],
  providers: [CommentService, PrismaService],
  exports: [CommentService],
})
export class CommentModule {}
