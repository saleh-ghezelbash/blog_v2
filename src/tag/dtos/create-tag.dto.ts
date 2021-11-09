import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateTagDto{
    
    @IsString({message:"Title must be a string!"})
    @MinLength(2,{message:"Minimom characters for Title is 2!"})
    @MaxLength(20,{message:"Maximom characters for Title is 20!"})
    title:string;
}