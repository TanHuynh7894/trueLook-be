import { Module } from '@nestjs/common';
import { SupersetService } from './superset.service';
import { SupersetController } from './superset.controller';

@Module({
  controllers: [SupersetController],
  providers: [SupersetService],
})
export class SupersetModule {}
