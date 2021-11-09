import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateCommenttDto{

    @IsString({message:"Content must be a string!"})
    @MinLength(1,{message:"Minimom characters for Content is 1!"})
    @MaxLength(2000,{message:"Maximom characters for Content is 2000!"})
    content: string;
}