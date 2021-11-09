import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class forgetPasswordDTO {

    @IsEmail()
    email:string;
}