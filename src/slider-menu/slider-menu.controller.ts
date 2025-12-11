import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SliderMenuService } from './slider-menu.service';
import { CreateSliderMenuDto } from './dto/create-slider-menu.dto';
import { UpdateSliderMenuDto } from './dto/update-slider-menu.dto';

@Controller('slider-menu')
export class SliderMenuController {
  constructor(private readonly sliderMenuService: SliderMenuService) {}

  @Post()
  create(@Body() createSliderMenuDto: CreateSliderMenuDto) {
    return this.sliderMenuService.create(createSliderMenuDto);
  }

  @Get()
  findAll() {
    return this.sliderMenuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sliderMenuService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSliderMenuDto: UpdateSliderMenuDto) {
    return this.sliderMenuService.update(+id, updateSliderMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sliderMenuService.remove(+id);
  }
}
