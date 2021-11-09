import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from 'src/category/category.entity';
import { CategoryModule } from 'src/category/category.module';
import { Comment } from 'src/comment/comment.entity';
import { CommentModule } from 'src/comment/comment.module';
import { Tag } from 'src/tag/tag.entity';
import { TagModule } from 'src/tag/tag.module';
import { User } from 'src/user/user.entity';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { PostController } from './post.controller';
import { Post } from './post.entity';
import { PostService } from './post.service';

@Module({
  imports:[TypeOrmModule.forFeature([Post,Cat,Tag,Comment,User])],
  controllers: [PostController],
  providers: [PostService,
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
  ]
})
export class PostModule {}
