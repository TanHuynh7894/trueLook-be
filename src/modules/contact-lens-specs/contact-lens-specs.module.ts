import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactLensSpecsService } from './contact-lens-specs.service';
import { ContactLensSpecsController } from './contact-lens-specs.controller';
import { ContactLensSpec } from './entities/contact-lens-spec.entity';
import { ContactLensAxis } from '../contact_lens_axis/entities/contact_lens_axi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactLensSpec, ContactLensAxis])],
  controllers: [ContactLensSpecsController],
  providers: [ContactLensSpecsService],
})
export class ContactLensSpecsModule {}
