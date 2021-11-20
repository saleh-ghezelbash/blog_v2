import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchPostDto, SortedByEnum } from 'src/post/dtos/search-post.dto';
import { Post } from 'src/post/post.entity';
import { Repository } from 'typeorm';
import { Cat as Category } from './category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) { }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find();


    // return this.categoriesRepository.find({
    //   // where:{
    //   //   id:MoreThan(id), //id و createdAt باهم and شده اند
    //   //   createdAt:MoreThan(new Date('2020-03-04T13:20:05'))
    //   // }

    //   // where:[
    //   //   {id:3},//id و createdAt باهم or شده اند
    //   //   {createdAt:Date.now}
    //   // ]

    //   // where:{description:Like('%تست%')}

    //   // order:{id:'DESC'}

    //   // take:2

    //   // select:['id','title']
    // });
  }

  async findOne(id: string, filters: SearchPostDto) {

    // return this.categoriesRepository.findOne(id,{relations:['posts']});

    // const query = await this.categoriesRepository.createQueryBuilder('cat')
    // .leftJoinAndSelect('cat.posts','post')
    // .leftJoinAndSelect('post.user', 'user')
    // .andWhere('cat.id = :id', { id })
    // .select(['cat','post.id', 'post.title',  'post.content', 'post.createdAt','user.id', 'user.name'])
    // .getOne();

    const cat = await this.categoriesRepository.createQueryBuilder('cat')
      // .leftJoinAndSelect('cat.posts','post')
      // .leftJoinAndSelect('post.user', 'user')
      .andWhere('cat.id = :id', { id })
      // .select(['cat','post.id', 'post.title',  'post.content', 'post.createdAt','user.id', 'user.name'])
      .getOne();



    const postsQuery = await this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.category', 'cat', 'cat.id = :catId', { catId: id })
      .select(['post.id', 'post.title', 'post.content', 'post.createdAt','post.imageCover', 'user.id', 'user.name'])
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
      ...cat,
      posts: {
        items: postsResult[0],
        totalResult: postsResult[1]
      }
    }

  }

  //   async create(title:string): Promise<Category> {
  //     return await this.categoriesRepository.save({title});
  //   }
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {

    const cat = await this.categoriesRepository.findOne({ where: { title: createCategoryDto.title } });
    if (cat) {
      throw new BadRequestException("Category Title must be unique!");
    }
    return await this.categoriesRepository.save(createCategoryDto);
  }

  async removeCat(id: string): Promise<string> {
    const cat = await this.categoriesRepository.findOne(id);
    if (!cat) {
      throw new BadRequestException("Category not found!");
    }

    try {
      await this.categoriesRepository.delete(id);
      return 'ok'
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

  }

}
