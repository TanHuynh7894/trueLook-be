import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { In, Repository } from 'typeorm';
import { ProductVariant } from './entities/product_variant.entity';
import { Product } from '../products/entities/product.entity';
import { Image } from '../images/entities/image.entity';
import { ProductCategory } from '../product_categories/entities/product_category.entity';
import { FrameSpec } from '../frame-specs/entities/frame-spec.entity';
import { RxLensSpec } from '../rx-lens-specs/entities/rx-lens-spec.entity';
import { ContactLensSpec } from '../contact-lens-specs/entities/contact-lens-spec.entity';
import { ProductVariantSearchQueryDto } from './dto/product-variant-search-query.dto';
import { Category } from '../categories/entities/category.entity';
import { Feature } from '../feartures/entities/fearture.entity';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(ProductCategory)
    private productCategoriesRepository: Repository<ProductCategory>,
    @InjectRepository(FrameSpec)
    private frameSpecsRepository: Repository<FrameSpec>,
    @InjectRepository(RxLensSpec)
    private rxLensSpecsRepository: Repository<RxLensSpec>,
    @InjectRepository(ContactLensSpec)
    private contactLensSpecsRepository: Repository<ContactLensSpec>,
    @InjectRepository(Feature)
    private featuresRepository: Repository<Feature>,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    const product = await this.productsRepository.findOneBy({ id: createProductVariantDto.product_id });
    if (!product) {
      throw new NotFoundException(`Product with id ${createProductVariantDto.product_id} not found`);
    }

    const existingCode = await this.productVariantsRepository.findOneBy({ code: createProductVariantDto.code });
    if (existingCode) {
      throw new ConflictException(`Product variant code ${createProductVariantDto.code} already exists`);
    }

    const newProductVariant = this.productVariantsRepository.create(createProductVariantDto);
    return await this.productVariantsRepository.save(newProductVariant);
  }

  async findAll(query: ProductVariantSearchQueryDto) {
    const filteredVariantIds = await this.filterVariantIds(query);
    if (!filteredVariantIds.length) return [];

    const variants = await this.productVariantsRepository.find({
      where: { id: In(filteredVariantIds) },
    });
    if (!variants.length) return [];

    const variantIds = variants.map((variant) => variant.id);
    const productIds = [...new Set(variants.map((variant) => variant.product_id))];
    const [products, productCategories, frameSpecs, rxLensSpecs, contactLensSpecs, images] =
      await Promise.all([
        this.productsRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.brand', 'brand')
          .where('product.id IN (:...productIds)', { productIds })
          .getMany(),
        this.productCategoriesRepository.find({
          where: productIds.map((productId) => ({ product_id: productId })),
          relations: ['category'],
        }),
        this.frameSpecsRepository.find({
          where: productIds.map((productId) => ({ product_id: productId })),
        }),
        this.rxLensSpecsRepository.find({
          where: productIds.map((productId) => ({ product_id: productId })),
        }),
        this.contactLensSpecsRepository.find({
          where: productIds.map((productId) => ({ product_id: productId })),
        }),
        this.imagesRepository.find({
          where: variantIds.map((variantId) => ({ variant_id: variantId })),
        }),
      ]);

    const rxLensSpecIds = rxLensSpecs.map((spec) => spec.id);
    const features =
      rxLensSpecIds.length > 0
        ? await this.featuresRepository.find({
            where: rxLensSpecIds.map((rxLensId) => ({ rx_lens_id: rxLensId })),
          })
        : [];
    const featuresByRxLens = features.reduce<Record<string, Feature[]>>((acc, item) => {
      if (!acc[item.rx_lens_id]) acc[item.rx_lens_id] = [];
      acc[item.rx_lens_id].push(item);
      return acc;
    }, {});

    const productMap = new Map(products.map((product) => [product.id, product]));
    const categoriesByProduct = productCategories.reduce<Record<string, any[]>>((acc, item) => {
      if (!acc[item.product_id]) acc[item.product_id] = [];
      if (item.category) acc[item.product_id].push(item.category);
      return acc;
    }, {});

    return variants.map((variant) => {
      const product = productMap.get(variant.product_id);
      return {
        ...variant,
        images: images.filter((image) => image.variant_id === variant.id),
        product: product
          ? {
              ...product,
              categories: categoriesByProduct[variant.product_id] || [],
              specs: {
                frame_specs: frameSpecs.filter((spec) => spec.product_id === variant.product_id),
                rx_lens_specs: rxLensSpecs
                  .filter((spec) => spec.product_id === variant.product_id)
                  .map((spec) => ({
                    ...spec,
                    features: featuresByRxLens[spec.id] || [],
                  })),
                contact_lens_specs: contactLensSpecs.filter(
                  (spec) => spec.product_id === variant.product_id,
                ),
              },
            }
          : null,
      };
    });
  }

  async findOne(id: string) {
    const productVariant = await this.productVariantsRepository.findOneBy({ id });
    if (!productVariant) {
      throw new NotFoundException(`Product variant with id ${id} not found`);
    }

    const [product, productCategories, frameSpecs, rxLensSpecs, contactLensSpecs, images] =
      await Promise.all([
        this.productsRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.brand', 'brand')
          .where('product.id = :id', { id: productVariant.product_id })
          .getOne(),
        this.productCategoriesRepository.find({
          where: { product_id: productVariant.product_id },
          relations: ['category'],
        }),
        this.frameSpecsRepository.find({
          where: { product_id: productVariant.product_id },
        }),
        this.rxLensSpecsRepository.find({
          where: { product_id: productVariant.product_id },
        }),
        this.contactLensSpecsRepository.find({
          where: { product_id: productVariant.product_id },
        }),
        this.imagesRepository.find({
          where: { variant_id: productVariant.id },
        }),
      ]);

    const rxLensSpecIds = rxLensSpecs.map((spec) => spec.id);
    const features =
      rxLensSpecIds.length > 0
        ? await this.featuresRepository.find({
            where: rxLensSpecIds.map((rxLensId) => ({ rx_lens_id: rxLensId })),
          })
        : [];
    const featuresByRxLens = features.reduce<Record<string, Feature[]>>((acc, item) => {
      if (!acc[item.rx_lens_id]) acc[item.rx_lens_id] = [];
      acc[item.rx_lens_id].push(item);
      return acc;
    }, {});

    return {
      ...productVariant,
      images,
      product: product
        ? {
            ...product,
            categories: productCategories
              .map((item) => item.category)
              .filter((category) => !!category),
            specs: {
              frame_specs: frameSpecs,
              rx_lens_specs: rxLensSpecs.map((spec) => ({
                ...spec,
                features: featuresByRxLens[spec.id] || [],
              })),
              contact_lens_specs: contactLensSpecs,
            },
          }
        : null,
    };
  }

  private async filterVariantIds(query: ProductVariantSearchQueryDto): Promise<string[]> {
    const qb = this.productVariantsRepository
      .createQueryBuilder('variant')
      .leftJoin('variant.product', 'product')
      .leftJoin(ProductCategory, 'pc', 'pc.product_id = product.id')
      .leftJoin(Category, 'category', 'category.id = pc.category_id')
      .select('variant.id', 'id')
      .distinct(true);

    if (query.search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(variant.name) LIKE :search OR LOWER(variant.code) LIKE :search)',
        {
          search: `%${query.search.toLowerCase()}%`,
        },
      );
    }

    if (query.category_name) {
      qb.andWhere('LOWER(category.name) LIKE :categoryName', {
        categoryName: `%${query.category_name.toLowerCase()}%`,
      });
    }

    if (query.product_type) {
      qb.andWhere('LOWER(product.product_type) = :productType', {
        productType: query.product_type.toLowerCase(),
      });
    }

    if (query.min_price !== undefined) {
      qb.andWhere('variant.price >= :minPrice', { minPrice: query.min_price });
    }

    if (query.max_price !== undefined) {
      qb.andWhere('variant.price <= :maxPrice', { maxPrice: query.max_price });
    }

    if (query.color) {
      qb.andWhere('LOWER(variant.color) LIKE :color', {
        color: `%${query.color.toLowerCase()}%`,
      });
    }

    const rawRows = await qb.getRawMany<{ id: string }>();
    return rawRows.map((row) => row.id);
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    await this.findOne(id);

    await this.productVariantsRepository.update(id, updateProductVariantDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const variant = await this.productVariantsRepository.findOneBy({ id });
    if (!variant) {
      throw new NotFoundException(`Khong tim thay Product variant id ${id}`);
    }

    await this.productVariantsRepository.update(id, { status: 'Inactive' });

    return {
      message: `Da xoa product variant ${id} thanh cong`,
      statusCode: 200,
    };
  }

  async addImage(variantId: string, path: string) {
    const variant = await this.productVariantsRepository.findOneBy({ id: variantId });
    if (!variant) {
      throw new NotFoundException(`Product variant with id ${variantId} not found`);
    }

    const image = this.imagesRepository.create({
      variant_id: variantId,
      path,
    });

    return this.imagesRepository.save(image);
  }
}
