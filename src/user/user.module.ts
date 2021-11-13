import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { ProfileController } from './profile.controller';
import { Post } from 'src/post/post.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User,Post])],
  controllers: [UserController, ProfileController],
  providers: [UserService],
})
export class UserModule {}
