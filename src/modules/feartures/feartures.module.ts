import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeaturesService } from './feartures.service';
import { FeaturesController } from './feartures.controller';
import { Feature } from './entities/fearture.entity';
import { RxLensSpec } from '../rx-lens-specs/entities/rx-lens-spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feature, RxLensSpec])],
  controllers: [FeaturesController],
  providers: [FeaturesService],
})
export class FeaturesModule {}
