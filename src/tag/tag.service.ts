import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dtos/create-tag.dto';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private tagsRepository: Repository<Tag>,
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
    
     async findOne(id: string): Promise<Tag> {
        // return this.tagsRepository.findOne(id);
        return await this.tagsRepository.createQueryBuilder('tag')
        .leftJoinAndSelect('tag.posts','post')
        .leftJoinAndSelect('post.user', 'user')
        .andWhere('tag.id = :id', { id })
        .select(['tag','post.id', 'post.title', 'post.slug', 'post.content', 'post.createdAt', 'post.imageCover','user.id', 'user.name'])
        .getOne();
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
