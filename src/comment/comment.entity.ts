import { Post } from "src/post/post.entity";
import { User } from "src/user/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    @ManyToOne(() => Comment,comment => comment.childs,{onDelete:"CASCADE",onUpdate:"CASCADE"})
    parent:Comment;

    @OneToMany(() => Comment, comment => comment.parent)
    @JoinColumn({name:"parentId"})
    childs:Comment[];

    @BeforeInsert()
    beforeIn(){
      this.createdAt = new Date();
      this.isApproved = false;
    }
}