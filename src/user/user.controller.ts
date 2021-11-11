import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GetUser } from 'src/auth/get-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
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
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
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
    @UploadedFile() file: Express.Multer.File
  ): Promise<User> {
 
    // console.log('file::', file);
    return this.userService.updateUser(updateUserDto, file);
  }
}
