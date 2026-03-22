import { Module } from '@nestjs/common';
import { AiSupersetService } from './ai-superset.service';
import { AiSupersetController } from './ai-superset.controller';

@Module({
  controllers: [AiSupersetController],
  providers: [AiSupersetService],
})
export class AiSupersetModule {}
