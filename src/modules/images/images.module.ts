import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesAdminController, ImagesController } from './images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image, ProductVariant])],
  controllers: [ImagesController, ImagesAdminController],
  providers: [ImagesService],
})
export class ImagesModule {}
