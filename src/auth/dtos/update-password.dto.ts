import { IsString, MaxLength, MinLength } from "class-validator";

export class UpdatePasswordDto{
    
    @IsString({message:"Password must be a string!"})
    @MinLength(6,{message:"Minimom characters for Password is 6!"})
    @MaxLength(40,{message:"Maximom characters for Password is 40!"})
    // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'Password is too weak!'})
    password:string;
    
    @IsString()
    confirmpassword:string;
}