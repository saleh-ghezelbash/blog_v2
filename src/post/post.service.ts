import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Bookmark } from 'src/bookmark/bookmark.entity';
import { Cat } from 'src/category/category.entity';
import { CategoryService } from 'src/category/category.service';
import { Comment } from 'src/comment/comment.entity';
import { Tag } from 'src/tag/tag.entity';
import { TagService } from 'src/tag/tag.service';
import { User, UserRoleEnum } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CreateCommenttDto } from './dtos/create-comment.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { SearchPostDto, SortedByEnum } from './dtos/search-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Post } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Cat)
    private catRepository: Repository<Cat>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>
  ) { }

  private ensureOwnerShip(user: User, post: Post): boolean {
    if (user.role == UserRoleEnum.ADMIN) {
      return true;
    }
    return user.id === post.user.id;
  }

  public getPostsWithCommentCountQuery() // این متد یک کوئری قابل استفاده در بقیه متدها و کوئری های دیگر است
  {
    return this.postsRepository.createQueryBuilder('post')
      // تعداد کامنت های هر پست را تولید  میکند
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
  }


  async findAll(filters: SearchPostDto) {
    // return await this.postsRepository.find();

    // return await this.postsRepository.createQueryBuilder('post')
    //   .leftJoinAndSelect('post.user', 'user')
    //   .select(['post.id', 'post.title', 'post.slug', 'post.content', 'post.createdAt','user.id', 'user.name'])
    //   .loadRelationCountAndMap('post.commentCount', 'post.comments')
    //   .orderBy('post.createdAt', 'DESC')
    //   .getMany();

    const q = await this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select(['post.id', 'post.title', 'post.slug', 'post.content', 'post.createdAt', 'post.likes', 'post.disLikes', 'user.id', 'user.name'])
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .orderBy('post.createdAt', 'DESC')

    const result = await this.filters(q, filters);

    return {
      items: result[0],
      totalResult: result[1]
    }

    // return this.postsRepository.find({
    //   relations:['category','comments']
    // });

    // return this.postsRepository.find({
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

  filters(query, filters: SearchPostDto) {
    filters.page = !!filters.page ? filters.page : 1;
    const skip = (filters.page - 1) * 10;
    filters.search = !!filters.search ? filters.search : "";
    filters.sortBy = !!filters.sortBy ? filters.sortBy : SortedByEnum.createdAt;

    return query.andWhere("post.title like :title", { title: `%${filters.search}%` })
      .orWhere("post.content like :content", { content: `%${filters.search}%` })
      .orWhere("user.name like :userName", { userName: `%${filters.search}%` })
      // .select(fields)
      .orderBy(`post.${filters.sortBy}`, 'DESC')//override prev orderby
      .skip(skip)
      .take(10)
      .getManyAndCount();
  }

  async findOne(id: string): Promise<Post> {
    // return this.postsRepository.findOne(id);

    return await this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'cat')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.comments', 'comment', 'comment.isApproved = :isApproved', { isApproved: true })
      .leftJoinAndSelect('comment.user', 'commentUser')
      .andWhere('post.id = :id', { id })
      .select(['post.id', 'post.title', 'post.slug', 'post.content', 'post.createdAt', 'post.imageCover', 'post.likes', 'post.disLikes', 'user.id', 'user.name', 'user.aboutMe'
        , 'cat.id', 'cat.title', 'tag.id', 'tag.title', 'comment.id', 'comment.content', 'comment.createdAt',
        'commentUser.id', 'commentUser.name'
      ])
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .getOne()
  }

  async findPostImage(id: string, res) {
    let photo = await this.postsRepository.findOne(id, { select: ['imageCover'] });

    // return photo
    // return 'data:image/jpeg;base64,' + photo.imageCover
    // const img_base64 = 'dataimage/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='


    // Extract image data
    const m = /^data:(.+?);base64,(.+)$/.exec(photo.imageCover)
    // const m = /^data:(.+?);base64,(.+)$/.exec(img_base64)
    if (!m) throw new Error(`Not a base64 image [${photo.imageCover}]`)
    const [_, content_type, file_base64] = m
    const file = Buffer.from(file_base64, 'base64')

    res.writeHead(200, {
      'Content-Type': content_type,
      'Content-Length': file.length
    });
    res.end(file);
    // return file
  }

  // async create(
  //     createPostDto: CreatePostDto,
  //     // user: User
  // ): Promise<Post> {
  //     // console.log('createPostDto:', createPostDto);
  //     const { tags, category } = createPostDto;
  //     const cat: Cat = await this.categoryService.findOne(category.toString())
  //     const tag: Tag[] = [];
  //     tags.forEach(async t => {
  //         tag.push(await this.tagService.findOne(t.toString()));
  //     })

  //     return this.postsRepository.save({
  //         ...createPostDto,
  //         // user,
  //         category: cat,
  //         tags: tag,
  //         slug : slugify(createPostDto.title,{lower:true})
  //     });
  // }

  async create(
    createPostDto: CreatePostDto,
    user: User,
    // file: Express.Multer.File
  ): Promise<Post> {

    // if (file.size > 1000000) {
    //   throw new BadRequestException('Maximom valid image size is 1Mb!')
    // }

    if (await this.postsRepository.findOne({ where: { title: createPostDto.title } })) {
      throw new BadRequestException("Post Title must be unique!")
    }

    const cat = await this.catRepository.findOne(createPostDto.categoryId);
    if (!cat) {
      throw new NotFoundException("Category not Found!");
    }

    try {
      const tags = await this.tagRepository.findByIds(createPostDto.tagIds);
      // const tags = await this.tagRepository.createQueryBuilder("tag")
      //   .where("tag.id IN (:...ids)", { ids: createPostDto.tagIds })
      //   .getMany();

      // const tags: Tag[] = [];
      // createPostDto.tagIds.forEach(async t => {
      //         tags.push(await this.tagRepository.findOne(t.toString()));
      //     })
      const p = this.postsRepository.create(createPostDto);

      p.category = cat;
      p.tags = tags;
      p.user = user;
      // p.imageCover = file.buffer;
      // var bufferBase64 = Buffer.from(file.buffer).toString('base64');
      // p.imageCover = bufferBase64;

      const post = await this.postsRepository.save(p);

      return await this.postsRepository.createQueryBuilder('post')
        .leftJoinAndSelect('post.category', 'cat')
        .leftJoinAndSelect('post.tags', 'tag')
        .leftJoinAndSelect('post.user', 'user')
        .andWhere('post.id = :id', { id: post.id })
        .select(['post', 'user.id', 'user.name'
          , 'cat.id', 'cat.title', 'tag.id', 'tag.title',
        ])
        .getOne()
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

  }

  async remove(id: string, user: User): Promise<string> {

    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException("Post not found!");
    }

    if (!this.ensureOwnerShip(user, post)) {
      throw new UnauthorizedException("You are not own this Post!");
    }
    await this.postsRepository.delete(id);
    return 'ok'
  }

  async update(
    updatePostDto: UpdatePostDto,
    user: User
  ) {

    const p = await this.findOne(updatePostDto.id.toString());

    if (!p) {
      throw new NotFoundException("Post not found!");
    }

    if (!this.ensureOwnerShip(user, p)) {
      throw new UnauthorizedException("You are not own this Post!");
    }

    if (await this.postsRepository.findOne({ where: { title: updatePostDto.title } })) {
      throw new BadRequestException("Post Title must be unique!")
    }

    const cat = await this.catRepository.findOne(updatePostDto.categoryId);
    if (!cat) {
      throw new NotFoundException("Category not Found!");
    }

    try {
      const tags = await this.tagRepository.findByIds(updatePostDto.tagIds);
      // const tags = await this.tagRepository.createQueryBuilder("tag")
      // .where("tag.id IN (:...ids)", { ids:updatePostDto.tagIds })
      // .getMany();

      const post = this.postsRepository.create(updatePostDto);
      post.category = cat;
      post.tags = tags;

      await this.postsRepository.save(post);

      return this.findOne(updatePostDto.id.toString());
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

  }

  async createComment(
    postId: string,
    createCommenttDto: CreateCommenttDto,
    user: User
  ): Promise<string> {
    const post = await this.postsRepository.findOne(postId, { relations: ['user'] });
    if (!post) {
      throw new BadRequestException("Post not found!");
    }

    if (!createCommenttDto.parent_id) {
      // const p = await this.findOne(postId);
      if (user.role != UserRoleEnum.ADMIN && this.ensureOwnerShip(user, post)) {
        throw new UnauthorizedException("You can not Comment for your own Post!");
      }

      try {
        const comment = this.commentRepository.create(createCommenttDto);
        comment.parent = null;
        comment.post = post;
        comment.user = user;
        await this.commentRepository.save(comment);
        return 'ok';
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

    } else {

      const parentComment = await this.commentRepository.findOne(createCommenttDto.parent_id);
      if (!parentComment) {
        throw new BadRequestException("Parent comment not found!");
      }

      try {
        const comment = this.commentRepository.create(createCommenttDto);
        comment.parent = parentComment;
        comment.post = post;
        comment.user = user;
        await this.commentRepository.save(comment);
        return 'ok';
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    }

  }

  async relatedPost(id: string): Promise<Post[]> {
    const post = await this.postsRepository.findOne(id, { relations: ['category'] });
    if (!post) {
      throw new BadRequestException("Post not found!");
    }

    return this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'cat')
      .andWhere('cat.id = :id', { id: post.category.id })
      .select(['post.id', 'post.title', 'post.slug', 'post.content', 'post.createdAt', 'post.likes', 'post.disLikes'])
      .limit(5)
      .getMany();
  }

  async like(postId, user) {
    const post = await this.postsRepository.findOne(postId, { relations: ['user'] });
    if (!post) {
      throw new BadRequestException("Post not found!");
    }
    if (this.ensureOwnerShip(user, post)) {
      throw new UnauthorizedException("You can not Like on your own Post!");
    }

    user.id = user.id.toString();
    try {
      if (!post.likes.includes(user.id)) {
        post.likes.push(user.id);
      }

      if (post.disLikes.includes(user.id)) {
        post.disLikes = post.disLikes.filter(userId => userId !== user.id);
      }

      await this.postsRepository.save(post);
      return 'ok!';
    } catch (error) {
      throw new InternalServerErrorException();
    }

  }

  async disLike(postId, user) {
    const post = await this.postsRepository.findOne(postId, { relations: ['user'] });
    if (!post) {
      throw new BadRequestException("Post not found!");
    }

    if (this.ensureOwnerShip(user, post)) {
      throw new UnauthorizedException("You can not DisLike on your own Post!");
    }

    user.id = user.id.toString();
    try {
      if (!post.disLikes.includes(user.id)) {
        post.disLikes.push(user.id);
      }

      if (post.likes.includes(user.id)) {
        post.likes = post.likes.filter(userId => userId !== user.id);
      }

      await this.postsRepository.save(post);
      return 'ok!';
    } catch (error) {
      throw new InternalServerErrorException();
    }

  }

  async mostPopularPosts() {

    let m = await this.postsRepository.createQueryBuilder('post')
      .select(['post.id', 'post.title', 'post.slug', 'post.content', 'post.createdAt', 'post.likes', 'post.disLikes'])
      .getMany();

    return m.sort((a, b) => {
      return b.likes.length - a.likes.length;
    })
      .slice(0, 5)
  }

  // async bookmark(postId:string,action,user:User){
  //   const post = await this.postsRepository.findOne(postId);
  //   if (!post) {
  //     throw new BadRequestException("Post not found!");
  //   }

  //   try {
  //     const bookmark = this.bookmarkRepository.create();
  //     if(action == 'do'){
  //       bookmark.bookmark = true;
  //     }else if(action == 'undo'){
  //       bookmark.bookmark = false;
  //     }
  //     bookmark.post = post;
  //     bookmark.user = user;
  //     await this.bookmarkRepository.save(bookmark);
  //     return 'ok';
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async getComments(postId,commentId){
    const post = await this.postsRepository.findOne(postId);
    if (!post) {
      throw new BadRequestException("Post not found!");
    }

    if (!commentId) {
      return this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post','post')
      .leftJoinAndSelect('comment.parent','parent')
      .where('post.id = :postId',{postId})
      .andWhere('parent.id IS NULL')
      .andWhere('comment.isApproved = :isApproved', { isApproved: true })
      .getManyAndCount();
    } else {
      return this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post','post')
      .leftJoinAndSelect('comment.parent','parent')
      .leftJoinAndSelect('comment.user','user')
      .select(['comment','post.id','post.title','post.slug','post.createdAt','parent','user.id','user.name','user.photo'])
      .where('post.id = :postId',{postId})
      .andWhere('parent.id = :parentId',{parentId:commentId})
      .andWhere('comment.isApproved = :isApproved', { isApproved: true })
      .getManyAndCount();
    }
  }
}
