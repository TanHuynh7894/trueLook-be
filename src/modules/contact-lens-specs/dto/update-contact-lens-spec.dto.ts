import { PartialType } from '@nestjs/mapped-types';
import { CreateContactLensSpecDto } from './create-contact-lens-spec.dto';

export class UpdateContactLensSpecDto extends PartialType(CreateContactLensSpecDto) {}