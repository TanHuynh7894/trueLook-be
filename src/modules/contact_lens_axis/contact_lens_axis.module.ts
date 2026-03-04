import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactLensAxis } from './entities/contact_lens_axi.entity';
import { ContactLensAxisController } from './contact_lens_axis.controller';
import { ContactLensAxisService } from './contact_lens_axis.service';
import { ContactLensSpec } from '../contact-lens-specs/entities/contact-lens-spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactLensAxis, ContactLensSpec])],
  controllers: [ContactLensAxisController],
  providers: [ContactLensAxisService],
})
export class ContactLensAxisModule {}
