import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandsPublicController } from './brands.public.controller';
import { BrandsAdminController } from './brands.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandsController, BrandsPublicController, BrandsAdminController],
  providers: [BrandsService],
})
export class BrandsModule {}
