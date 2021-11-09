import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class SigninDTO{
    @IsEmail({},{message:"Please provide a correct Email address!"})
    email:string;

    @IsString({message:"Password must be a string!"})
    @MinLength(6,{message:"Minimom characters for Password is 6!"})
    @MaxLength(40,{message:"Maximom characters for Password is 40!"})
    // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'Password is too weak!'})
    password:string;
}