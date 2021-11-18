import slugify from 'slugify';
import { Bookmark } from 'src/bookmark/bookmark.entity';
import { Cat } from 'src/category/category.entity';
import { Comment } from 'src/comment/comment.entity';
import { Tag } from 'src/tag/tag.entity';
import { User } from 'src/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable, RelationCount, BeforeInsert, BeforeUpdate, OneToOne } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

    @Column()
    title: string;

    @Column()
    slug: string;

    @Column()
    content: string;

    @Column()
    // imageCover: Buffer;
    imageCover: string;

    @Column({
        // default:Date.now
    })
    createdAt: Date;

    @Column()
    modifiedAt: Date;

    // @Column()
    // categoryId:number;

    @ManyToOne(() => Cat, category => category.posts,{onDelete:'SET NULL'})
    @JoinColumn({name:'categoryId'})
    category: Cat;

    @ManyToOne(() => User, user => user.posts,{onDelete:"CASCADE",onUpdate:"CASCADE"})
    user: User;

    @OneToOne(() => Bookmark, bookmark => bookmark.post)
    bookmark: Bookmark;

    @ManyToMany(() => Tag, tag => tag.posts,{onDelete:"CASCADE",onUpdate:"CASCADE"})
    @JoinTable({ name: 'post_tag' })
    tags: Tag[];

    tagsId:number[];

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    // چون decorator column ندارد در دیتابیس ذخیره نمی شود ولی در خروجی نمایش داده میشود
    // @RelationCount((comment:Comment) => comment.post)
    commentCount?: number;

    @BeforeInsert()
    beforeIn(){
      
      this.slug = slugify(this.title,{lower:true});
      this.createdAt = new Date();
    }

    @BeforeUpdate()
    beforeUp(){
      this.slug = slugify(this.title,{lower:true});
      this.modifiedAt = new Date();
    }

    @Column("simple-array")
    likes:number[];

    @Column("simple-array")
    disLikes:number[];
}