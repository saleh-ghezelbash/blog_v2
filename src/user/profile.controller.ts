import { BadRequestException, Body, Controller, Delete, Get, Param, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GetUser } from 'src/auth/get-user.decorator';
import { Helper } from 'src/shared/helper';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly userService: UserService) { }


  @Get(':id')
  findProfile(@Param('id') id: string): Promise<User> {
    return this.userService.findProfile(id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  myProfile(@GetUser() user: User): Promise<User> {
    return this.userService.myProfile(user);
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
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file.size > 1000000) {
      throw new BadRequestException('Maximom valid image size is 1Mb!')
    }
    // console.log('file::', file);
    // console.log('dto:', updateProfileDto);
    return this.userService.updateProfile(user, updateProfileDto,file);
  }
}
