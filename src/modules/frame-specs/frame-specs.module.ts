import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FrameSpecsService } from './frame-specs.service';
import { FrameSpecsController } from './frame-specs.controller';
import { FrameSpec } from './entities/frame-spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FrameSpec])],
  controllers: [FrameSpecsController],
  providers: [FrameSpecsService],
})
export class FrameSpecsModule {}
