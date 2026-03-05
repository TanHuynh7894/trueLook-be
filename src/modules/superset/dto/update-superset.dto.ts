import { PartialType } from '@nestjs/swagger';
import { CreateSupersetDto } from './create-superset.dto';

export class UpdateSupersetDto extends PartialType(CreateSupersetDto) {}
