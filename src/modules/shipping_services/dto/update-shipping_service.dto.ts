import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingServiceDto } from './create-shipping_service.dto';

export class UpdateShippingServiceDto extends PartialType(CreateShippingServiceDto) {}
