import { PartialType } from '@nestjs/mapped-types';
import { CreateRxLensSpecDto } from './create-rx-lens-spec.dto';

export class UpdateRxLensSpecDto extends PartialType(CreateRxLensSpecDto) {}