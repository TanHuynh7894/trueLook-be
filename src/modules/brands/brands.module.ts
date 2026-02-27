import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsAdminController, BrandsController, BrandsPublicController } from './brands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandsController, BrandsPublicController, BrandsAdminController],
  providers: [BrandsService],
})
export class BrandsModule {}
