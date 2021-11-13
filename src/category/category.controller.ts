import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Cat as Category } from "./category.entity";
import { CreateCategoryDto } from './dtos/create-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleEnum } from 'src/user/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { SearchPostDto } from 'src/post/dtos/search-post.dto';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    // @Post()
    // create(@Body('title') title): Promise<Category> {
    //   return this.categoryService.create(title);
    // }
    // @Post()
    // create(@Body() category): Promise<Category> {
    //   return this.categoryService.create(category.title);
    // }
    @Post()
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    create(@Body(ValidationPipe) createCategoryDto:CreateCategoryDto): Promise<Category> {
      return this.categoryService.create(createCategoryDto);
    }
  
    @Get()
    findAll(): Promise<Category[]> {
      return this.categoryService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id',new ParseIntPipe()) id,@Query() filters: SearchPostDto){    
      return this.categoryService.findOne(id,filters);
    }
  
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    removeCat(@Param('id',ParseIntPipe) id: string):Promise<string>{
      return this.categoryService.removeCat(id);
    }
}
