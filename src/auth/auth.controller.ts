import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';
import { forgetPasswordDTO } from './dtos/forget-password.dto';
import { ResetPasswordDTO } from './dtos/reset-password.dto';
import { SigninDTO } from './dtos/signin.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/signin')
  signin(@Res({ passthrough: true }) res: Response, @Body(ValidationPipe) credentials: SigninDTO) {
    return this.authService.signin(credentials, res);
  }

  @Post('/signup')
  signup(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) createUserDto: CreateUserDto
  ) {
    return this.authService.signup(createUserDto, req, res);
  }

  @Get('/confirmemail/:token')
  confirmEmail(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.confirmEmail(token,res);
  }

  @Get('/signout')
  @UseGuards(AuthGuard('jwt'))
  signout(@Res({ passthrough: true }) res: Response) {
    return this.authService.signout(res);
  }

  @Put('/updatepassword')
  @UseGuards(AuthGuard('jwt'))
  updatePassword(
    @GetUser() user: User,
    @Body(ValidationPipe) updatePasswordDto: UpdatePasswordDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.updatePassword(user, updatePasswordDto, res)
  }

  @Post('/forgetpassword')
  forgetPassword(
    @Body(ValidationPipe) credential: forgetPasswordDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.forgetPassword(credential, req, res)
  }

  @Put('/resetpassword/:token')
  resetPassword(
    @Param('token') token: string,
    @Body(ValidationPipe) resetPasswordDTO: ResetPasswordDTO,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.resetPassword(token, resetPasswordDTO, res)
  }
}
