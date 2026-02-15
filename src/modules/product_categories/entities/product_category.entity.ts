import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('product_categories')
export class ProductCategory {
  @PrimaryColumn({ name: 'product_id', type: 'varchar', length: 15 })
  product_id: string;

  @PrimaryColumn({ name: 'category_id', type: 'varchar', length: 15 })
  category_id: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Category;
}
