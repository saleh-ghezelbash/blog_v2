import { BadRequestException, Body, Controller, Delete, Get, Param, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { GetUser } from 'src/auth/get-user.decorator';
import { SearchPostDto } from 'src/post/dtos/search-post.dto';
import { Helper } from 'src/shared/helper';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly userService: UserService) { }


  @Get(':id')
  findProfile(@Param('id') id: string,@Query() filters: SearchPostDto){
    return this.userService.findProfile(id,filters);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  myProfile(@GetUser() user: User,@Query() filters: SearchPostDto){
    return this.userService.myProfile(user,filters);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  deleteProfile(@GetUser() user: User): Promise<string> {
    return this.userService.deleteProfile(user);
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: Helper.userProfileDestinationPath,
      filename: Helper.userProfileCustomFileName
    }),
    fileFilter: Helper.multerFilter,
  }))
  updateProfile(@GetUser() user: User,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.userService.updateProfile(user, updateProfileDto,file,req);
  }

  @Put(':userId/follow')
  @UseGuards(AuthGuard('jwt'))
  follow(@Param('userId') userId: string,@GetUser() user: User){
    return this.userService.follow(userId,user);
  }

  @Put(':userId/unfollow')
  @UseGuards(AuthGuard('jwt'))
  unFollow(@Param('userId') userId: string,@GetUser() user: User){
    return this.userService.unFollow(userId,user);
  }
}
