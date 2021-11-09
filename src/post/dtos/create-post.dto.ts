import { IsString,IsNumber,MinLength, MaxLength, IsArray, IsNotEmpty } from "class-validator";
import { Post } from "../post.entity";



export class CreatePostDto{
    @IsString({message:"Title must be a string!"})
    @MinLength(2,{message:"Minimom characters for Title is 2!"})
    @MaxLength(200,{message:"Maximom characters for Title is 200!"})
    title: string;
    
    @IsString({message:"Content must be a string!"})
    @MinLength(20,{message:"Minimom characters for Content is 20!"})
    @MaxLength(2000,{message:"Maximom characters for Content is 2000!"})
    content:string;

    imageCover:string;

    @IsNotEmpty()
    categoryId: number;

    @IsArray()
    @IsNumber({},{each: true,message:"Each value in tagIds must be a number!"})
    tagIds:number[];

}

