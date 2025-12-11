import { PartialType } from '@nestjs/mapped-types';
import { CreateSliderMenuDto } from './create-slider-menu.dto';

export class UpdateSliderMenuDto extends PartialType(CreateSliderMenuDto) {}
