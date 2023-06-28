import { forwardRef, Module } from '@nestjs/common';

import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaModule } from '../common/orm/prisma.module';
import { PrismaService } from '../common/orm/prisma.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, forwardRef(() => UserModule)],
  controllers: [CommentController],
  providers: [CommentService, PrismaService],
  exports: [CommentService],
})
export class CommentModule {}
