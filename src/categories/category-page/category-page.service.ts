import { Injectable } from '@nestjs/common';
import { CreateCategoryPageDto } from './dto/create-category-page.dto';
import { UpdateCategoryPageDto } from './dto/update-category-page.dto';

@Injectable()
export class CategoryPageService {
  create(createCategoryPageDto: CreateCategoryPageDto) {
    return 'This action adds a new categoryPage';
  }

  findAll() {
    return `This action returns all categoryPage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoryPage`;
  }

  update(id: number, updateCategoryPageDto: UpdateCategoryPageDto) {
    return `This action updates a #${id} categoryPage`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoryPage`;
  }
}
