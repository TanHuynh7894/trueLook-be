import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesPublicController } from './categories.public.controller';
import { CategoriesAdminController } from './categories.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController, CategoriesPublicController, CategoriesAdminController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
