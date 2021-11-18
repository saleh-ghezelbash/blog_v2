import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";
import { CreatePostDto } from "./create-post.dto";

// export class UpdatePostDto extends PartialType(CreatePostDto) {}

// export type UpdatePostDto = Partial<CreatePostDto>

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @IsNotEmpty()
    id:number;
}