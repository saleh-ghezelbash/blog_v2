import { BadRequestException, HttpCode, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { SearchPostDto, SortedByEnum } from 'src/post/dtos/search-post.dto';
import { Post } from 'src/post/post.entity';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) { }

  async findAll(): Promise<User[]> {
    // return this.usersRepository.find();
    return await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .select(['user.id', 'user.name', 'user.email', 'user.role', 'user.aboutMe', 'user.followers', 'user.following', 'user.photo','post.id', 'post.title',  'post.createdAt'])
      .getMany();
  }

  async findOne(id: string, filters: SearchPostDto) {
    // return this.usersRepository.findOne(id);

    // return await this.usersRepository.createQueryBuilder('user')
    //   .leftJoinAndSelect('user.posts', 'post')
    //   .leftJoinAndSelect('post.comments', 'comment')
    //   // .leftJoinAndSelect('post.comments', 'comment', 'comment.isApproved = :isApproved', { isApproved: true })
    //   .andWhere('user.id = :id', { id })
    //   .select(['user.id', 'user.name', 'user.email', 'user.role', 'post.id', 'post.title', 'post.createdAt', 'comment'])
    //   .getOne()

    const userResult = await this.usersRepository.createQueryBuilder('user')
      .andWhere('user.id = :id', { id })
      .select(['user.id', 'user.name', 'user.email', 'user.role', 'user.aboutMe', 'user.followers', 'user.following','user.photo'])
      .getOne()


    const postsQuery = await this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user', 'user.id = :userId', { userId: id })
      .select(['post.id', 'post.title',  'post.content', 'post.createdAt','post.imageCover'])
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .orderBy('post.createdAt', 'DESC')

    filters.page = !!filters.page ? filters.page : 1;
    const skip = (filters.page - 1) * 10;
    filters.search = !!filters.search ? filters.search : "";
    filters.sortBy = !!filters.sortBy ? filters.sortBy : SortedByEnum.createdAt;

    const postsResult = await postsQuery.andWhere("post.title like :title", { title: `%${filters.search}%` })
      .orWhere("post.content like :content", { content: `%${filters.search}%` })
      // .select(fields)
      .orderBy(`post.${filters.sortBy}`, 'DESC')//override prev orderby
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      ...userResult,
      posts: {
        items: postsResult[0],
        totalResult: postsResult[1]
      }
    }

  }


  async remove(id: string): Promise<string> {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new BadRequestException("User not found!");
    }

    try {
      await this.usersRepository.delete(id);
      return 'ok'
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
    req: Request,
  ): Promise<User> {
    const u = await this.usersRepository.findOne(updateUserDto.id);
    if (!u) {
      throw new BadRequestException("User not found!");
    }

    if (!!file && file.size > 1000000) {
      throw new BadRequestException('Maximom valid image size is 1Mb!')
    }

    let photoFullPath = "";
    if (!!file) {
       photoFullPath =`${req.protocol}://${req.get('host')}/images/users/photos/${file.filename}`;
    }else{
      photoFullPath = u.photo;
    }

    try {
      const user = this.usersRepository.create(updateUserDto);
      user.photo = photoFullPath;
      // user.photo = file.filename;
      await this.usersRepository.save(user);
      // return this.findOne(updateUserDto.id.toString());
      return await this.usersRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'post')
        .leftJoinAndSelect('post.comments', 'comment')
        .andWhere('user.id = :id', { id: updateUserDto.id.toString() })
        .select(['user.id', 'user.name', 'user.email', 'user.role', 'user.aboutMe','user.photo', 'post.id', 'post.title',  'post.createdAt', 'comment'])
        .getOne()
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

  }

  async findProfile(id: string, filters: SearchPostDto) {
    // return await this.usersRepository.createQueryBuilder('user')
    //   .leftJoinAndSelect('user.posts', 'post')
    //   .andWhere('user.id = :id', { id })
    //   .select(['user.id', 'user.name', 'post.id', 'post.title',  'post.createdAt'])
    //   .getOne();

    const userResult = await this.usersRepository.createQueryBuilder('user')
      .andWhere('user.id = :id', { id })
      .select(['user.id', 'user.name', 'user.aboutMe', 'user.following', 'user.followers','user.photo'])
      .getOne();


    const postsQuery = await this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user', 'user.id = :userId', { userId: id })
      .select(['post.id', 'post.title',  'post.content', 'post.createdAt','post.imageCover'])
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .orderBy('post.createdAt', 'DESC')

    filters.page = !!filters.page ? filters.page : 1;
    const skip = (filters.page - 1) * 10;
    filters.search = !!filters.search ? filters.search : "";
    filters.sortBy = !!filters.sortBy ? filters.sortBy : SortedByEnum.createdAt;

    const postsResult = await postsQuery.andWhere("post.title like :title", { title: `%${filters.search}%` })
      .orWhere("post.content like :content", { content: `%${filters.search}%` })
      // .select(fields)
      .orderBy(`post.${filters.sortBy}`, 'DESC')//override prev orderby
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      ...userResult,
      posts: {
        items: postsResult[0],
        totalResult: postsResult[1]
      }
    }
  }

  async deleteProfile(user: User): Promise<string> {
    const u = await this.usersRepository.findOne(user.id);
    if (!u) {
      throw new BadRequestException("User not found!");
    }

    try {
      await this.usersRepository.delete(user.id);
      return 'ok'
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

  }

  async updateProfile(
    user: User,
    updateProfileDto: UpdateProfileDto,
    file: Express.Multer.File,
    req: Request,
  ): Promise<User> {

    const us = await this.usersRepository.findOne(user.id);
    if (!us) {
      throw new BadRequestException("User not found!");
    }

    if (!!file && file.size > 1000000) {
      throw new BadRequestException('Maximom valid image size is 1Mb!')
    }

    try {
      let photoFullPath = "";
      if (!!file) {
         photoFullPath =`${req.protocol}://${req.get('host')}/images/users/photos/${file.filename}`;
      }else{
        photoFullPath = us.photo;
      }

      const u = this.usersRepository.create({
        id: user.id,
        ...updateProfileDto,
        photo: photoFullPath
        // photo: file.filename
      });
      await this.usersRepository.save(u);
      // return this.findOne(user.id.toString());
      return await this.usersRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'post')
        .andWhere('user.id = :id', { id: user.id.toString() })
        .select(['user.id', 'user.name', 'user.email', 'user.role', 'user.aboutMe', 'user.photo', 'post.id', 'post.title', 'post.createdAt'])
        .getOne();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async myProfile(user: User, filters: SearchPostDto) {
    const us = await this.usersRepository.findOne(user.id);
    if (!us) {
      throw new BadRequestException("User not found!");
    }

    // return this.findOne(user.id.toString());

    // return await this.usersRepository.createQueryBuilder('user')
    //   .leftJoinAndSelect('user.posts', 'post')
    //   .andWhere('user.id = :id', { id: user.id.toString() })
    //   .select(['user.id', 'user.name', 'user.email', 'user.role', 'post.id', 'post.title',  'post.createdAt'])
    //   .getOne();

    const userResult = await this.usersRepository.createQueryBuilder('user')
      // .leftJoinAndSelect('user.posts', 'post')
      .andWhere('user.id = :id', { id: user.id.toString() })
      .select(['user.id', 'user.name', 'user.email', 'user.role', 'user.aboutMe', 'user.followers', 'user.following','user.photo'])
      .getOne();

    const followers = await this.usersRepository.findByIds(userResult.followers,
      { select: ['id', 'name'] })

    const following = await this.usersRepository.findByIds(userResult.following,
      { select: ['id', 'name'] })

    const postsQuery = await this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user', 'user.id = :userId', { userId: user.id.toString() })
      .select(['post.id', 'post.title',  'post.content', 'post.createdAt','post.imageCover'])
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .orderBy('post.createdAt', 'DESC')

    filters.page = !!filters.page ? filters.page : 1;
    const skip = (filters.page - 1) * 10;
    filters.search = !!filters.search ? filters.search : "";
    filters.sortBy = !!filters.sortBy ? filters.sortBy : SortedByEnum.createdAt;

    const postsResult = await postsQuery.andWhere("post.title like :title", { title: `%${filters.search}%` })
      .orWhere("post.content like :content", { content: `%${filters.search}%` })
      // .select(fields)
      .orderBy(`post.${filters.sortBy}`, 'DESC')//override prev orderby
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      ...userResult,
      following,
      followers,
      posts: {
        items: postsResult[0],
        totalResult: postsResult[1]
      }
    }

  }


  async follow(userId, user) {
    const u = await this.usersRepository.findOne(userId);
    if (!u) {
      throw new BadRequestException("User not found!");
    }
    if (userId == user.id) {
      throw new UnauthorizedException("You can not Follow yourself!");
    }

    try {
      if (!u.following.includes(user.id.toString())) {
        u.following.push(user.id.toString());
      }

      if (!user.followers.includes(u.id.toString())) {
        user.followers.push(u.id.toString());
      }

      await this.usersRepository.save(u);
      await this.usersRepository.save(user);
      return 'ok!';
    } catch (error) {
      throw new InternalServerErrorException();
    }

  }

  async unFollow(userId, user) {
    const u = await this.usersRepository.findOne(userId);
    if (!u) {
      throw new BadRequestException("User not found!");
    }
    if (userId == user.id) {
      throw new UnauthorizedException("You can not UnFollow yourself!");
    }

    try {
      if (u.following.includes(user.id.toString())) {
        u.following = u.following.filter(id => id.toString() !== user.id.toString());
      }

      if (user.followers.includes(u.id.toString())) {
        user.followers = user.followers.filter(id => id.toString() !== u.id.toString());
      }

      await this.usersRepository.save(u);
      await this.usersRepository.save(user);
      return 'ok!';
    } catch (error) {
      throw new InternalServerErrorException();
    }

  }
}
