import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContactLensSpec } from '../../contact-lens-specs/entities/contact-lens-spec.entity';

@Entity('contact_lens_axis')
export class ContactLensAxis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 15 })
  contact_lens_spec_id: string;

  @Column({ type: 'int' })
  axis_value: number;

  @ManyToOne(() => ContactLensSpec, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_lens_spec_id' })
  contactLensSpec: ContactLensSpec;
}
