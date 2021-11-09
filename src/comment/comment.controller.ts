import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoleEnum } from 'src/user/user.entity';
import { CommentService } from './comment.service';

@Controller('comment')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@Roles(UserRoleEnum.ADMIN)
export class CommentController {
    constructor(private commentService:CommentService){}

    @Get()
    allComments(){
        return this.commentService.allComments();
    }

    @Get(':id')
    findOne(@Param('id') id:string){
        return this.commentService.findOne(id);
    }

    @Delete(':id')
    deleteOne(@Param('id') id:string){
        return this.commentService.deleteOne(id);
    }

    @Put(':id')
    isApproved(@Param('id') id:string,@Body('isApproved',ParseBoolPipe) isApproved:boolean){
        return this.commentService.isApproved(id,isApproved);
    }
}
