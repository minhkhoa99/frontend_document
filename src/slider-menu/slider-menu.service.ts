import { Injectable } from '@nestjs/common';
import { CreateSliderMenuDto } from './dto/create-slider-menu.dto';
import { UpdateSliderMenuDto } from './dto/update-slider-menu.dto';

@Injectable()
export class SliderMenuService {
  create(createSliderMenuDto: CreateSliderMenuDto) {
    return 'This action adds a new sliderMenu';
  }

  findAll() {
    return `This action returns all sliderMenu`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sliderMenu`;
  }

  update(id: number, updateSliderMenuDto: UpdateSliderMenuDto) {
    return `This action updates a #${id} sliderMenu`;
  }

  remove(id: number) {
    return `This action removes a #${id} sliderMenu`;
  }
}
