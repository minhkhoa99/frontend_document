import { Module } from '@nestjs/common';
import { SliderMenuService } from './slider-menu.service';
import { SliderMenuController } from './slider-menu.controller';

@Module({
  controllers: [SliderMenuController],
  providers: [SliderMenuService],
})
export class SliderMenuModule {}
