import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './bookmark.entity';

@Injectable()
export class BookmarkService {
    constructor(@InjectRepository(Bookmark) private bookmarkRepo:Repository<Bookmark>){}

    findAll(){
      return  this.bookmarkRepo.find();
    }
}
