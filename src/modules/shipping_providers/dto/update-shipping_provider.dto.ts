import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingProviderDto } from './create-shipping_provider.dto';

export class UpdateShippingProviderDto extends PartialType(CreateShippingProviderDto) {}
