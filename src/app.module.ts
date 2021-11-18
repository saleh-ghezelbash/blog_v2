import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mysqlConfig } from './config/database.config';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';
import { CategoryModule } from './category/category.module';
import { PostModule } from './post/post.module';
import { Tag } from './tag/tag.entity';
import { Post } from './post/post.entity';
import { Cat } from './category/category.entity';
import { UserModule } from './user/user.module';
import { Comment } from './comment/comment.entity';
import { User } from './user/user.entity';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { BookmarkModule } from './bookmark/bookmark.module';
import { Bookmark } from './bookmark/bookmark.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'blogv2',
    synchronize: true,
    // entities: [join(__dirname, '/../**/**.entity{.ts,.js}')],
    entities: [Tag, Post, Cat, Comment, User,Bookmark]
  }), 
  // ServeStaticModule.forRoot({
  //   rootPath: join(__dirname, '..', 'public'),
  // }),
  MulterModule.register({
    // dest: './public/images',
    // limits: { fieldSize: 1, fileSize: 1 }

  }),
  TagModule, CommentModule, CategoryModule, PostModule, UserModule, AuthModule, MailModule, BookmarkModule],
  controllers: [],
  providers: [
    // {
    //   // This is for Catch all errors especially Typeorm errors!
    //   // This not working for some validation for example password requierments
    //   provide: APP_FILTER,
    //   useClass: GlobalExceptionFilter
    // }
  ],
})
export class AppModule { }
