import { BadRequestException, ConflictException, HttpCode, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SigninDTO } from './dtos/signin.dto';
import { Request, Response } from 'express';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDTO } from './dtos/reset-password.dto';
import { forgetPasswordDTO } from './dtos/forget-password.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRipository: Repository<User>,
        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    async signin(credentials: SigninDTO, res: Response) {

        const { email, password } = credentials;

        const user = await this.userRipository.findOne({
            where: { email, verified: true },
            select: ['id', 'name', 'email', 'password','photo']
        })

        if (user && await bcrypt.compare(password, user.password)) {

            const payload = { username: email };
            const token = this.jwtService.sign(payload);
            const cookieOptions = {
                expires: new Date(
                    Date.now() + 90 * 24 * 60 * 60 * 1000
                ),
                httpOnly: true
            };
            res.cookie('jwt', token, cookieOptions);

            user.password = undefined;

            return { ...user, token };
        }

        throw new UnauthorizedException('Invalid credentials!');
    }

    async signup(createUserDto: CreateUserDto, req: Request, res: Response) {

        const { name, email, password, confirmpassword } = createUserDto;

        const u = await this.userRipository.findOne({ where: { email } });
        if (u) {
            throw new BadRequestException("This email is already exist!");
        }

        if (password !== confirmpassword) {
            throw new BadRequestException('Passwords are not the same!')
        }

        const hash_password = await bcrypt.hash(password, 10);
        let photoFullPath = `${req.protocol}://${req.get('host')}/images/users/user-profile.jpg`;
        const user = this.userRipository.create({
            name,
            email,
            password: hash_password,
            photo: photoFullPath
        });

        const t = crypto.randomBytes(32).toString('hex');

        user.confirmEmailToken = crypto
            .createHash('sha256')
            .update(t)
            .digest('hex');

        const createdUser = await this.userRipository.save(user);
        // const payload = { username: email };
        // const token = this.jwtService.sign(payload);
        // const cookieOptions = {
        //     expires: new Date(
        //         Date.now() + 90 * 24 * 60 * 60 * 1000
        //     ),
        //     httpOnly: true
        // };
        // res.cookie('jwt', token, cookieOptions);

        // return { ...createdUser, token };


        const URL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/auth/confirmemail/${t}`;

        const message = `Submit a GET request to: ${URL}.`;

        try {
            await this.mailService.sendUserMail({
                email: createdUser.email,
                subject: 'Your account registration',
                message,
                //html: `Click <a href='${url}'>here</a> to confirm your email.`
            });

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email!'
            });
        } catch (error) {
            await this.userRipository.delete(createdUser.id);

            throw new InternalServerErrorException('There was an error sending the email. Try again later!');

        }

    }

    async confirmEmail(token: string, res: Response) {

        if (!token) {
            throw new BadRequestException("Invalid token!");
        }

        const confirmEmailToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await this.userRipository.findOne({
            where: {
                confirmEmailToken: confirmEmailToken,
                verified: false
            }
        });

        if (!user) {
            throw new UnauthorizedException('Token is invalid!');
        }

        user.confirmEmailToken = null;
        user.verified = true;

        try {
            await this.userRipository.save(user);

            res.status(200).json({
                status: 'success',
                message: 'Email successfully verified. please signin to your account!'
            });
        } catch (error) {

            throw new InternalServerErrorException();
        }

    }

    signout(res: Response) {
        res.clearCookie("jwt");
    }

    async updatePassword(user: User, updatePasswordDto: UpdatePasswordDto, res: Response) {

        const { password, confirmpassword } = updatePasswordDto;

        if (password !== confirmpassword) {
            throw new BadRequestException('Passwords are not the same!')
        }

        const hash_password = await bcrypt.hash(password, 10);

        const u = this.userRipository.create({
            id: user.id,
            password: hash_password
        });

        // this is just for forget and reset password action
        u.resetPasswordToken = null;
        u.resetPaswordExpire = null;

        await this.userRipository.save(u);
        const payload = { username: user.email };
        const token = this.jwtService.sign(payload);
        const cookieOptions = {
            expires: new Date(
                Date.now() + 90 * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
        };
        res.cookie('jwt', token, cookieOptions);

        const cu = await this.userRipository.findOne(user.id,
            { select: ['id', 'name', 'email'] })

        return { ...cu, token };

    }

    async forgetPassword({ email }: forgetPasswordDTO, req: Request, res: Response) {
        const user = await this.userRipository.findOne({ where: { email } })
        if (!user) {
            throw new UnauthorizedException('Invalid credentials!');
        }

        // 2) Generate the random reset token
        const resetToken = user.createPasswordResetToken();

        await this.userRipository.save(user);

        // 3) Send it to user's email
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/auth/resetpassword/${resetToken}`;

        const message = `Forgot your password? Submit a PUT request with your new password and confirmpassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

        try {
            await this.mailService.sendUserMail({
                email: user.email,
                subject: 'Your password reset token (valid for 10 min)',
                message
            });

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email!'
            });
        } catch (err) {
            user.resetPasswordToken = null;
            user.resetPaswordExpire = null;
            await this.userRipository.save(user);

            throw new InternalServerErrorException('There was an error sending the email. Try again later!');
        }
    }

    async resetPassword(token: string, resetPasswordDTO: ResetPasswordDTO, res: Response) {
        // 1) Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await this.userRipository.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPaswordExpire: MoreThan(Date.now())
            }
        });

        if (!user) {
            throw new UnauthorizedException('Token is invalid or has expired!');
        }

        return this.updatePassword(user, resetPasswordDTO, res);

    }


}
