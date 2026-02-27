import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController, CategoriesPublicController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController, CategoriesPublicController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
