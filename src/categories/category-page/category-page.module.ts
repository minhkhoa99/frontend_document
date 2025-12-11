import { Module } from '@nestjs/common';
import { CategoryPageService } from './category-page.service';
import { CategoryPageController } from './category-page.controller';

@Module({
  controllers: [CategoryPageController],
  providers: [CategoryPageService],
})
export class CategoryPageModule {}
