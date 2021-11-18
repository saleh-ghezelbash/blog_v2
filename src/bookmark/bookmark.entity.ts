import { Post } from "src/post/post.entity";
import { User } from "src/user/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Bookmark {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'bool', width: 1 })
    bookmark: boolean;

    @OneToOne(() => Post, post => post.bookmark,{onDelete:"CASCADE",onUpdate:"CASCADE"})
    @JoinColumn({name:'postId'})
    post: Post;

    @ManyToOne(type => User, user => user.bookmarks,{onDelete:"CASCADE",onUpdate:"CASCADE"})
    user: User;

}