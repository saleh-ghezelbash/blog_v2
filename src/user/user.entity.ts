import { Comment } from 'src/comment/comment.entity';
import { Post } from 'src/post/post.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import * as crypto from 'crypto';

export enum UserRoleEnum {
    ADMIN = 'ادمین',
    USER = 'کاربر',
    PUBLISHER = 'نویسنده'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    // @Column({select:false})
    password: string;

    @Column()
    aboutMe: string;

    @Column({
        // default:"./images/user-profile.jpg"
    })
    photo:string;

    @Column('enum', { enum: UserRoleEnum, default: UserRoleEnum.USER })
    role: UserRoleEnum;

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[]

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[]

    // This works just for output JSON Response
    toJSON() {
        delete this.password;
        return this;
    }

    @Column()
    resetPasswordToken: string;

    @Column()
    resetPaswordExpire: Date;

     createPasswordResetToken() {
        
        const resetToken =  crypto.randomBytes(32).toString('hex');
        
        this.resetPasswordToken =  crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        this.resetPaswordExpire = new Date(Date.now() + 10 * 60 * 1000);

        return resetToken;
    };

    @Column()
    confirmEmailToken:string;

    @Column({ type: 'bool', width: 1 })
    verified:boolean;

}