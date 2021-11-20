import { Response, Body, Controller, Delete, Get, Header, Param, Post, Put, UploadedFile, UseFilters, UseGuards, UseInterceptors, ValidationPipe, Query, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './post.entity';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { CreateCommenttDto } from './dtos/create-comment.dto';
import { Comment } from 'src/comment/comment.entity';
import { Roles } from 'src/auth/roles.decorator';
import { User, UserRoleEnum } from 'src/user/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response as Res } from 'express';
import { SearchPostDto } from './dtos/search-post.dto';
import { diskStorage } from 'multer';
import { Helper } from 'src/shared/helper';

@Controller('post')
// @UseFilters(new HttpExceptionFilter())
export class PostController {
    constructor(private readonly postService: PostService) { }



    // @UsePipes(new ValidationPipe({groups:['create']}))
    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRoleEnum.PUBLISHER, UserRoleEnum.ADMIN)
    @UseInterceptors(FileInterceptor('imageCover', {
        storage: diskStorage({
            destination: Helper.imageCoverDestinationPath,
            filename: Helper.imageCoverCustomFileName
        }),
        fileFilter: Helper.multerFilter,
    }))
    create(
        @Body(new ValidationPipe({ whitelist: true })) createPostDto: CreatePostDto,
        @GetUser() user: User,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
    ): Promise<PostEntity> {
        // createPostDto.categoryId = 1;
        return this.postService.create(
            createPostDto,
            user,
            file,
            req
        );
    }



    // @Get('most-popular-post')
    // mostPopularPosts(){
    //    return this.postService.mostPopularPosts();
    // }

    @Get()
    findAll(@Query(new ValidationPipe()) filters: SearchPostDto) {
        return this.postService.findAll(filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<PostEntity> {
        return this.postService.findOne(id);
    }


    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRoleEnum.PUBLISHER, UserRoleEnum.ADMIN)
    remove(@Param('id') id: string, @GetUser() user: User): Promise<string> {
        return this.postService.remove(id, user);
    }

    // @UsePipes(new ValidationPipe({groups:['create']}))
    @Put()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRoleEnum.PUBLISHER, UserRoleEnum.ADMIN)
    @UseInterceptors(FileInterceptor('imageCover', {
        storage: diskStorage({
            destination: Helper.imageCoverDestinationPath,
            filename: Helper.imageCoverCustomFileName
        }),
        fileFilter: Helper.multerFilter,
    }))
    update(
        // @Body() updatePostDto: UpdatePostDto,
        @Body(new ValidationPipe({ whitelist: true })) updatePostDto: UpdatePostDto,
        @GetUser() user: User,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
    ) {
        
        // updatePostDto.id = 19;
        // updatePostDto.categoryId = 1;
        return this.postService.update(
            updatePostDto,
            user,
            file,
            req
        );
    }


    @Post(':postId/comment')
    @UseGuards(AuthGuard('jwt'))
    createComment(
        @Param('postId') postId: string,
        @Body(new ValidationPipe()) createCommenttDto: CreateCommenttDto,
        @GetUser() user: User
    ): Promise<string> {

        return this.postService.createComment(
            postId,
            createCommenttDto,
            user
        );
    }



    @Get(':id/relatedPost')
    relatedPost(@Param('id') id: string): Promise<PostEntity[]> {
        return this.postService.relatedPost(id);
    }

    @Put(':postId/like')
    @UseGuards(AuthGuard('jwt'))
    like(
        @Param('postId') postId: string,
        @GetUser() user: User
    ): Promise<string> {

        return this.postService.like(
            postId,
            user
        );
    }


    @Put(':postId/dislike')
    @UseGuards(AuthGuard('jwt'))
    disLike(
        @Param('postId') postId: string,
        @GetUser() user: User
    ): Promise<string> {

        return this.postService.disLike(
            postId,
            user
        );
    }

    // @Post(':postId/bookmark')
    // @UseGuards(AuthGuard('jwt'))
    // bookmark(
    //     @Param('postId') postId: string,
    //     @Query('action') action,
    //     @GetUser() user: User
    // ): Promise<string> {
    //     console.log('action:', action);

    //     return this.postService.bookmark(
    //         postId,
    //         action,
    //         user
    //     );
    // }

    @Get(':postId/comment')
    getComments(
        @Param('postId') postId,
        @Query('commentId') commentId
    ) {
        return this.postService.getComments(postId, commentId);
    }


}


