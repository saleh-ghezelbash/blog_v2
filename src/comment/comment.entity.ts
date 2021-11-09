import { Post } from "src/post/post.entity";
import { User } from "src/user/user.entity";
import { BeforeInsert, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    createdAt: Date;

    @Column({ type: 'bool', width: 1 })
    isApproved: boolean;

    @ManyToOne(() => Post, post => post.comments,{onDelete:"CASCADE",onUpdate:"CASCADE"})
    post: Post;

    @ManyToOne(type => User, user => user.comments,{onDelete:"CASCADE",onUpdate:"CASCADE"})
    user: User;

    @BeforeInsert()
    beforeIn(){
      this.createdAt = new Date();
      this.isApproved = false;
    }
}