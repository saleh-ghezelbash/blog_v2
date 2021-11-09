import { Body, Controller, Delete, Get, Param, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoleEnum } from 'src/user/user.entity';
import { CreateTagDto } from './dtos/create-tag.dto';
import { Tag } from './tag.entity';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
    constructor(private readonly tagService: TagService) {}

      @Post()
      @UseGuards(AuthGuard('jwt'),RolesGuard)
      @Roles(UserRoleEnum.ADMIN)
      create(@Body(ValidationPipe) createTagDto: CreateTagDto): Promise<Tag> {
        return this.tagService.create(createTagDto);
      }
    // @Post()
    // create(@Body('title') title): Promise<Tag> {
    //   return this.tagService.create(title);
    // }
    
      @Get()
      findAll(): Promise<Tag[]> {
        return this.tagService.findAll();
      }
    
      @Get(':id')
      findOne(@Param('id') id: string): Promise<Tag> {
        return this.tagService.findOne(id);
      }
    
      @Delete(':id')
      @UseGuards(AuthGuard('jwt'),RolesGuard)
      @Roles(UserRoleEnum.ADMIN)
      removeTag(@Param('id') id: string) {
        return this.tagService.removeTag(id);
      }
}
