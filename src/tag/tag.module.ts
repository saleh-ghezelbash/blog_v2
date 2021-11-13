import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/post.entity';
import { TagController } from './tag.controller';
import { Tag } from './tag.entity';
import { TagService } from './tag.service';

@Module({
  imports:[TypeOrmModule.forFeature([Tag,Post])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
