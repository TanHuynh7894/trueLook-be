import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProductVariant } from '../../product_variants/entities/product_variant.entity';
import { Promotion } from '../../promotions/entities/promotion.entity';

@Entity('product_promotions')
export class ProductPromotion {
  @PrimaryColumn({ name: 'variant_id', type: 'varchar', length: 15 })
  variant_id: string;

  @PrimaryColumn({ name: 'promotion_id', type: 'varchar', length: 15 })
  promotion_id: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id', referencedColumnName: 'id' })
  variant: ProductVariant;

  @ManyToOne(() => Promotion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id', referencedColumnName: 'id' })
  promotion: Promotion;
}
