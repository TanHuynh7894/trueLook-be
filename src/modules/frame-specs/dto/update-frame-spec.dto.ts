import { PartialType } from '@nestjs/mapped-types';
import { CreateFrameSpecDto } from './create-frame-spec.dto';

export class UpdateFrameSpecDto extends PartialType(CreateFrameSpecDto) {}
