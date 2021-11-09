import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentService {
    constructor(@InjectRepository(Comment) private commentRepository: Repository<Comment>) { }

    async allComments(): Promise<Comment[]> {
        return await this.commentRepository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.post', 'post')
            .leftJoinAndSelect('comment.user', 'user')
            .orderBy({
                "comment.isApproved": "ASC",
                "post.createdAt": "ASC",
            })
            .select(['comment','post','user.id','user.name','user.email'])
            .getMany()
    }

    async findOne(id: string): Promise<Comment> {
        return await this.commentRepository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.post', 'post')
            .leftJoinAndSelect('comment.user', 'user')
            .andWhere('comment.id = :id', { id })
            .select(['comment','post','user.id','user.name','user.email'])
            .getOne()
    }

    async deleteOne(id: string): Promise<string> {
        const comment = await this.commentRepository.findOne(id);
        if (!comment) {
            throw new BadRequestException("Comment not found!");
        }

        try {
            await this.commentRepository.delete(id);
            return 'ok'
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async isApproved(id: string, isApproved: boolean) {
        const comment = await this.commentRepository.findOne(id);
        if (!comment) {
            throw new BadRequestException("Comment not found!");
        }

        try {
            await this.commentRepository.update(id, { isApproved })
            // return await this.commentRepository.createQueryBuilder()
            // .update(Comment)
            // .set({isApproved})
            // .where("id = :id", { id })
            // .execute();

            //  return this.commentRepository.findOne(id);
            return await this.commentRepository.createQueryBuilder('comment')
                .leftJoinAndSelect('comment.post', 'post')
                .leftJoinAndSelect('comment.user', 'user')
                .andWhere('comment.id = :id', { id })
                .select(['comment','post','user.id','user.name','user.email'])
                .getOne()
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }

    }
}
