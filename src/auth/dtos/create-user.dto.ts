import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto{
    
    @IsString({message:"Name must be a string!"})
    @MinLength(2,{message:"Minimom characters for Name is 2!"})
    @MaxLength(20,{message:"Maximom characters for Name is 20!"})
    name:string;

    @IsEmail({},{message:"Please provide a correct Email address!"})
    email:string;

    @IsString({message:"Password must be a string!"})
    @MinLength(6,{message:"Minimom characters for Password is 6!"})
    @MaxLength(40,{message:"Maximom characters for Password is 40!"})
    // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'Password is too weak!'})
    password:string;

    @IsString()
    confirmpassword:string;

}