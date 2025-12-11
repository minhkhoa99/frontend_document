import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryPageService } from './category-page.service';
import { CreateCategoryPageDto } from './dto/create-category-page.dto';
import { UpdateCategoryPageDto } from './dto/update-category-page.dto';

@Controller('category-page')
export class CategoryPageController {
  constructor(private readonly categoryPageService: CategoryPageService) {}

  @Post()
  create(@Body() createCategoryPageDto: CreateCategoryPageDto) {
    return this.categoryPageService.create(createCategoryPageDto);
  }

  @Get()
  findAll() {
    return this.categoryPageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryPageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryPageDto: UpdateCategoryPageDto) {
    return this.categoryPageService.update(+id, updateCategoryPageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryPageService.remove(+id);
  }
}
