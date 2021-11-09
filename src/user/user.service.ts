import { BadRequestException, HttpCode, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findAll(): Promise<User[]> {
    // return this.usersRepository.find();
    return await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      // .select(['user.id','user.name','user.email','user.role','post.id','post.title','post.slug','post.imageCover','post.createdAt'])
      .getMany();
  }

  async findOne(id: string): Promise<User> {
    // return this.usersRepository.findOne(id);

    return await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .leftJoinAndSelect('post.comments', 'comment')
      // .leftJoinAndSelect('post.comments', 'comment', 'comment.isApproved = :isApproved', { isApproved: true })
      .andWhere('user.id = :id', { id })
      // .select(['post','cat.title','tag.title'])
      .getOne()

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

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {

    const u = await this.usersRepository.findOne(updateUserDto.id);
    if (!u) {
      throw new BadRequestException("User not found!");
    }

    try {
      const user = this.usersRepository.create(updateUserDto);
      await this.usersRepository.save(user);
      // return this.findOne(updateUserDto.id.toString());
      return await this.usersRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'post')
        .leftJoinAndSelect('post.comments', 'comment')
        .andWhere('user.id = :id', { id: updateUserDto.id.toString() })
        .getOne()
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

  }

  async findProfile(id: string): Promise<User> {
    return await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .andWhere('user.id = :id', { id })
      .select(['user.id', 'user.name', 'post.id', 'post.title', 'post.slug', 'post.imageCover', 'post.createdAt'])
      .getOne();
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

  async updateProfile(user: User, updateProfileDto: UpdateProfileDto): Promise<User> {

    const us = await this.usersRepository.findOne(user.id);
    if (!us) {
      throw new BadRequestException("User not found!");
    }

    try {
      const u = this.usersRepository.create({
        id: user.id,
        ...updateProfileDto
      });
      await this.usersRepository.save(u);
      // return this.findOne(user.id.toString());
      return await this.usersRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'post')
        .andWhere('user.id = :id', { id: user.id.toString() })
        .select(['user.id', 'user.name', 'user.email', 'user.role', 'post.id', 'post.title', 'post.slug', 'post.imageCover', 'post.createdAt'])
        .getOne();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async myProfile(user: User): Promise<User> {
    const us = await this.usersRepository.findOne(user.id);
    if (!us) {
      throw new BadRequestException("User not found!");
    }

    // return this.findOne(user.id.toString());
    return await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .andWhere('user.id = :id', { id: user.id.toString() })
      .select(['user.id', 'user.name', 'user.email', 'user.role', 'post.id', 'post.title', 'post.slug', 'post.imageCover', 'post.createdAt'])
      .getOne();
  }
}
