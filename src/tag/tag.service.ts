import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchPostDto, SortedByEnum } from 'src/post/dtos/search-post.dto';
import { Post } from 'src/post/post.entity';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dtos/create-tag.dto';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private tagsRepository: Repository<Tag>,
        @InjectRepository(Post)
        private postsRepository: Repository<Post>,
      ) {}

      findAll(): Promise<Tag[]> {
        return this.tagsRepository.find();
      }

      async create(createTagDto: CreateTagDto): Promise<Tag> {
        const tag = await this.tagsRepository.findOne({where:{title:createTagDto.title}});
        if (tag) {
          throw new BadRequestException("Tag Title must be unique!");
        }
        return await this.tagsRepository.save(createTagDto);
      }
    
     async findOne(id: string, filters: SearchPostDto){
        // return this.tagsRepository.findOne(id);

        // return await this.tagsRepository.createQueryBuilder('tag')
        // .leftJoinAndSelect('tag.posts','post')
        // .leftJoinAndSelect('post.user', 'user')
        // .andWhere('tag.id = :id', { id })
        // .select(['tag','post.id', 'post.title', 'post.slug', 'post.content', 'post.createdAt','user.id', 'user.name'])
        // .getOne();

        const tag =  await this.tagsRepository.createQueryBuilder('tag')
        // .leftJoinAndSelect('tag.posts','post')
        // .leftJoinAndSelect('post.user', 'user')
        .andWhere('tag.id = :id', { id })
        // .select(['tag','post.id', 'post.title', 'post.slug', 'post.content', 'post.createdAt','user.id', 'user.name'])
        .getOne();

        
    const postsQuery = await this.postsRepository.createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user')
    .leftJoinAndSelect('post.tags', 'tag', 'tag.id = :tagId', { tagId: id })
    .select(['post.id', 'post.title', 'post.slug', 'post.content', 'post.createdAt', 'user.id', 'user.name'])
    .loadRelationCountAndMap('post.commentCount', 'post.comments')
    .orderBy('post.createdAt', 'DESC')

  filters.page = !!filters.page ? filters.page : 1;
  const skip = (filters.page - 1) * 10;
  filters.search = !!filters.search ? filters.search : "";
  filters.sortBy = !!filters.sortBy ? filters.sortBy : SortedByEnum.createdAt;

  const postsResult = await postsQuery.andWhere("post.title like :title", { title: `%${filters.search}%` })
    .orWhere("post.content like :content", { content: `%${filters.search}%` })
    .orWhere("user.name like :userName", { userName: `%${filters.search}%` })
    // .select(fields)
    .orderBy(`post.${filters.sortBy}`, 'DESC')//override prev orderby
    .skip(skip)
    .take(10)
    .getManyAndCount();

  return {
    ...tag,
    posts: {
      items: postsResult[0],
      totalResult: postsResult[1]
    }
  }
      }
    
      async removeTag(id: string): Promise<string> {
        const tag = await this.tagsRepository.findOne(id);
        if (!tag) {
          throw new BadRequestException("Tag not found!");
        }

        try {
          await this.tagsRepository.delete(id);
          return 'ok'
        } catch (error) {
          throw new InternalServerErrorException(error.message);
        }
      }
}
