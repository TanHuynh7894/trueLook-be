import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RxLensSpecsService } from './rx-lens-specs.service';
import { RxLensSpecsController } from './rx-lens-specs.controller';
import { RxLensSpec } from './entities/rx-lens-spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RxLensSpec])],
  controllers: [RxLensSpecsController],
  providers: [RxLensSpecsService],
})
export class RxLensSpecsModule {}