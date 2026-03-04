import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RxLensSpecsService } from './rx-lens-specs.service';
import { RxLensSpecsController } from './rx-lens-specs.controller';
import { RxLensSpec } from './entities/rx-lens-spec.entity';
import { Feature } from '../feartures/entities/fearture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RxLensSpec, Feature])],
  controllers: [RxLensSpecsController],
  providers: [RxLensSpecsService],
})
export class RxLensSpecsModule {}
