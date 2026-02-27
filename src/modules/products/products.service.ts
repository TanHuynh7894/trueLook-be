import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Brand } from '../brands/entities/brand.entity';
import { ProductCategory } from '../product_categories/entities/product_category.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';
import { Image } from '../images/entities/image.entity';
import { FrameSpec } from '../frame-specs/entities/frame-spec.entity';
import { RxLensSpec } from '../rx-lens-specs/entities/rx-lens-spec.entity';
import { ContactLensSpec } from '../contact-lens-specs/entities/contact-lens-spec.entity';
import { PublicProductsQueryDto } from './dto/public-products-query.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(ProductCategory)
    private productCategoriesRepository: Repository<ProductCategory>,
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(FrameSpec)
    private frameSpecsRepository: Repository<FrameSpec>,
    @InjectRepository(RxLensSpec)
    private rxLensSpecsRepository: Repository<RxLensSpec>,
    @InjectRepository(ContactLensSpec)
    private contactLensSpecsRepository: Repository<ContactLensSpec>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const brand = await this.brandsRepository.findOneBy({ id: createProductDto.brand_id });
    if (!brand) {
      throw new NotFoundException(`Brand with id ${createProductDto.brand_id} not found`);
    }

    const existingCode = await this.productsRepository.findOneBy({ code: createProductDto.code });
    if (existingCode) {
      throw new ConflictException(`Product code ${createProductDto.code} already exists`);
    }

    const newProduct = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(newProduct);
  }

  findAll() {
    return this.productsRepository.find();
  }

  async findPublicProducts(query: PublicProductsQueryDto) {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('LOWER(product.status) = :status', { status: 'active' });

    if (query.brand_id) {
      queryBuilder.andWhere('product.brand_id = :brandId', { brandId: query.brand_id });
    }

    if (query.search) {
      queryBuilder.andWhere('(product.name ILIKE :search OR product.code ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.product_type) {
      queryBuilder.andWhere('LOWER(product.product_type) = LOWER(:productType)', {
        productType: query.product_type,
      });
    }

    if (query.category_id) {
      queryBuilder.innerJoin(
        'product_categories',
        'pc',
        'pc.product_id = product.id AND pc.category_id = :categoryId',
        { categoryId: query.category_id },
      );
    }

    const products = await queryBuilder
      .orderBy('product.create_at', 'DESC')
      .getMany();

    if (!products.length) {
      const filters = [
        query.search ? `search="${query.search}"` : null,
        query.brand_id ? `brand_id="${query.brand_id}"` : null,
        query.category_id ? `category_id="${query.category_id}"` : null,
        query.product_type ? `product_type="${query.product_type}"` : null,
      ]
        .filter(Boolean)
        .join(', ');

      throw new NotFoundException(
        filters
          ? `Khong tim thay san pham voi bo loc: ${filters}`
          : 'Khong tim thay san pham active',
      );
    }

    return products;
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async findPublicProductDetail(id: string) {
    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.id = :id', { id })
      .andWhere('LOWER(product.status) = :status', { status: 'active' })
      .getOne();

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const [categories, variants, frameSpecs, rxLensSpecs, contactLensSpecs] =
      await Promise.all([
        this.productCategoriesRepository.find({
          where: { product_id: id },
          relations: ['category'],
        }),
        this.productVariantsRepository
          .createQueryBuilder('variant')
          .where('variant.product_id = :productId', { productId: id })
          .andWhere('LOWER(variant.status) = :status', { status: 'active' })
          .orderBy('variant.create_at', 'ASC')
          .getMany(),
        this.frameSpecsRepository
          .createQueryBuilder('frameSpec')
          .where('frameSpec.product_id = :productId', { productId: id })
          .andWhere('LOWER(frameSpec.status) = :status', { status: 'active' })
          .getMany(),
        this.rxLensSpecsRepository
          .createQueryBuilder('rxSpec')
          .where('rxSpec.product_id = :productId', { productId: id })
          .andWhere('LOWER(rxSpec.status) = :status', { status: 'active' })
          .getMany(),
        this.contactLensSpecsRepository
          .createQueryBuilder('contactSpec')
          .where('contactSpec.product_id = :productId', { productId: id })
          .andWhere('LOWER(contactSpec.status) = :status', { status: 'active' })
          .getMany(),
      ]);

    const variantIds = variants.map((variant) => variant.id);
    const images = variantIds.length
      ? await this.imagesRepository.find({
          where: variantIds.map((variantId) => ({ variant_id: variantId })),
        })
      : [];

    const variantsWithImages = variants.map((variant) => ({
      ...variant,
      images: images.filter((image) => image.variant_id === variant.id),
    }));

    return {
      ...product,
      categories: categories.map((item) => item.category),
      variants: variantsWithImages,
      specs: {
        frame_specs: frameSpecs,
        rx_lens_specs: rxLensSpecs,
        contact_lens_specs: contactLensSpecs,
      },
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    if (updateProductDto.brand_id) {
      const brand = await this.brandsRepository.findOneBy({ id: updateProductDto.brand_id });
      if (!brand) {
        throw new NotFoundException(`Brand with id ${updateProductDto.brand_id} not found`);
      }
    }

    if (updateProductDto.code) {
      const existingCode = await this.productsRepository.findOneBy({ code: updateProductDto.code });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException(`Product code ${updateProductDto.code} already exists`);
      }
    }

    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async updateCoreInfo(
    id: string,
    payload: {
      name?: string;
      code?: string;
      description?: string;
    },
  ) {
    await this.findOne(id);

    if (payload.code) {
      const existingCode = await this.productsRepository.findOneBy({ code: payload.code });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException(`Product code ${payload.code} already exists`);
      }
    }

    await this.productsRepository.update(id, payload);
    return this.findOne(id);
  }

  async attachCategory(productId: string, categoryId: string) {
    const [product, category] = await Promise.all([
      this.productsRepository.findOneBy({ id: productId }),
      this.categoriesRepository.findOneBy({ id: categoryId }),
    ]);

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    if (!category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }

    const existed = await this.productCategoriesRepository.findOneBy({
      product_id: productId,
      category_id: categoryId,
    });
    if (existed) {
      throw new ConflictException(`Product category (${productId}, ${categoryId}) already exists`);
    }

    const newLink = this.productCategoriesRepository.create({
      product_id: productId,
      category_id: categoryId,
    });
    return this.productCategoriesRepository.save(newLink);
  }

  async createVariant(
    productId: string,
    payload: {
      code: string;
      name: string;
      price: number;
      color: string;
      quantity: number;
      description: string;
      status?: string;
    },
  ) {
    const product = await this.productsRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const existingCode = await this.productVariantsRepository.findOneBy({ code: payload.code });
    if (existingCode) {
      throw new ConflictException(`Product variant code ${payload.code} already exists`);
    }

    const variant = this.productVariantsRepository.create({
      ...payload,
      product_id: productId,
      status: payload.status ?? 'active',
    });
    return this.productVariantsRepository.save(variant);
  }

  async updateVariantPriceAndStock(
    variantId: string,
    payload: {
      price?: number;
      quantity?: number;
    },
  ) {
    const variant = await this.productVariantsRepository.findOneBy({ id: variantId });
    if (!variant) {
      throw new NotFoundException(`Product variant with id ${variantId} not found`);
    }

    await this.productVariantsRepository.update(variantId, payload);
    return this.productVariantsRepository.findOneBy({ id: variantId });
  }

  async addVariantImage(variantId: string, path: string) {
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

  async removeImage(imageId: string) {
    const result = await this.imagesRepository.delete(imageId);
    if (result.affected === 0) {
      throw new NotFoundException(`Image with id ${imageId} not found for delete`);
    }

    return {
      message: `Deleted image with id: ${imageId}`,
      statusCode: 200,
    };
  }

  async remove(id: string) {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id ${id} not found for delete`);
    }
    return {
      message: `Deleted product with id: ${id}`,
      statusCode: 200,
    };
  }
}
