import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { GetUser } from 'src/auth/get-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { SearchPostDto } from 'src/post/dtos/search-post.dto';
import { Helper } from 'src/shared/helper';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User, UserRoleEnum } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoleEnum.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) { }



  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Query() filters: SearchPostDto){
    return this.userService.findOne(id,filters);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<string> {
    return this.userService.remove(id);
  }

  @Put()
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: Helper.userProfileDestinationPath,
      filename: Helper.userProfileCustomFileName
    }),
    fileFilter: Helper.multerFilter,
  }))
  updateUser(@Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<User> {
 
    return this.userService.updateUser(updateUserDto,file,req);
  }
}
