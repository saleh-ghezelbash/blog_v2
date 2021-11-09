import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
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
  myProfile(@GetUser() user:User): Promise<User> {
    return this.userService.myProfile(user);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  deleteProfile(@GetUser() user:User): Promise<string> {
    return this.userService.deleteProfile(user);
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@GetUser() user:User,@Body() updateProfileDto:UpdateProfileDto): Promise<User> {
    return this.userService.updateProfile(user,updateProfileDto);
  }
}
