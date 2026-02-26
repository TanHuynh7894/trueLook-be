import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandsService } from './brands.service';

@ApiTags('Public Catalog')
@Controller('api/v1/brands')
export class BrandsPublicController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Lay thuong hieu co status active' })
  findActive() {
    return this.brandsService.findActive();
  }
}
