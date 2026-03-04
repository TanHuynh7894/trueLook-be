import { PartialType } from '@nestjs/mapped-types';
import { CreateFeatureDto } from './create-fearture.dto';

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
