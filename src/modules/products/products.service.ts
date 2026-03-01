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
import { Category } from '../categories/entities/category.entity';
import { Feature } from '../feartures/entities/fearture.entity';

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
    @InjectRepository(Feature)
    private featuresRepository: Repository<Feature>,
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

  async findAll() {
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.brand', 'brand', 'LOWER(brand.status) = :active', {
        active: 'active',
      })
      .where('LOWER(product.status) = :active', { active: 'active' })
      .orderBy('product.create_at', 'DESC')
      .getMany();
    if (!products.length) {
      throw new NotFoundException('Khong co san pham');
    }
    const detailedProducts = await Promise.all(products.map((product) => this.findOneDetail(product.id)));
    const cleanProducts = detailedProducts.map((product) => this.mapProductLikeListResponse(product));

    if (!cleanProducts.length) {
      throw new NotFoundException('Khong co san pham');
    }

    return cleanProducts;
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async findOneDetail(id: string) {
    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.id = :id', { id })
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
        this.productVariantsRepository.find({
          where: { product_id: id },
          order: { create_at: 'ASC' },
        }),
        this.frameSpecsRepository.find({
          where: { product_id: id },
        }),
        this.rxLensSpecsRepository.find({
          where: { product_id: id },
        }),
        this.contactLensSpecsRepository.find({
          where: { product_id: id },
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

    const detail = {
      ...product,
      categories: categories.map((item) => item.category),
      variants: variantsWithImages,
      specs: {
        frame_specs: frameSpecs,
        rx_lens_specs: rxLensSpecs.map((spec) => ({
          ...spec,
          features: featuresByRxLens[spec.id] || [],
        })),
        contact_lens_specs: contactLensSpecs,
      },
    };

    return this.mapProductLikeListResponse(detail);
  }

  private isActive(status?: string) {
    return (status || '').toLowerCase() === 'active';
  }

  private mapProductLikeListResponse(product: any) {
    const { variants, ...rest } = product;
    return {
      ...rest,
      categories: (rest.categories || []).filter((category) => this.isActive(category?.status)),
      specs: {
        frame_specs: (rest.specs?.frame_specs || []).filter((spec) => this.isActive(spec?.status)),
        rx_lens_specs: (rest.specs?.rx_lens_specs || [])
          .filter((spec) => this.isActive(spec?.status))
          .map((spec) => ({
            ...spec,
            features: (spec.features || []).filter((feature) => this.isActive(feature?.status)),
          })),
        contact_lens_specs: (rest.specs?.contact_lens_specs || []).filter((spec) =>
          this.isActive(spec?.status),
        ),
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
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Khong tim thay id ${id}`);
    }

    await this.productsRepository.update(id, { status: 'Inactive' });

    return {
      message: `Da xoa product ${id} thanh cong`,
      statusCode: 200,
    };
  }
}
