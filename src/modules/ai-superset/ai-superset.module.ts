import { Module } from '@nestjs/common';
import { AiSupersetService } from './ai-superset.service';
import { AiSupersetController } from './ai-superset.controller';
import { SupersetModule } from '../superset/superset.module';

@Module({
  imports: [SupersetModule],
  controllers: [AiSupersetController],
  providers: [AiSupersetService],
})
export class AiSupersetModule {}
