import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactLensSpecsService } from './contact-lens-specs.service';
import { ContactLensSpecsController } from './contact-lens-specs.controller';
import { ContactLensSpec } from './entities/contact-lens-spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactLensSpec])],
  controllers: [ContactLensSpecsController],
  providers: [ContactLensSpecsService],
})
export class ContactLensSpecsModule {}
