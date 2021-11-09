import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User, UserRoleEnum } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'),RolesGuard)
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
  updateUser(@Body(ValidationPipe) updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.updateUser(updateUserDto);
  }
}
