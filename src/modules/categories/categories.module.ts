import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesAdminController, CategoriesController, CategoriesPublicController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController, CategoriesPublicController, CategoriesAdminController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
