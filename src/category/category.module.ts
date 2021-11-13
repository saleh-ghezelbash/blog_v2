import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/post.entity';
import { CategoryController } from './category.controller';
import { Cat } from './category.entity';
import { CategoryService } from './category.service';

@Module({
  imports:[TypeOrmModule.forFeature([Cat,Post])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
