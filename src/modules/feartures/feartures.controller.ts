import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FeaturesService } from './feartures.service';
import { CreateFeatureDto } from './dto/create-fearture.dto';
import { UpdateFeatureDto } from './dto/update-fearture.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'System Admin hoac Manager tao feature' })
  create(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featuresService.create(createFeatureDto);
  }

  @Get()
  findAll() {
    return this.featuresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.featuresService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({
    summary:
      'System Admin hoac Manager cap nhat feature (rx_lens_id, name, description, status)',
  })
  update(@Param('id') id: string, @Body() updateFeatureDto: UpdateFeatureDto) {
    return this.featuresService.update(id, updateFeatureDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({
    summary: 'System Admin hoac Manager chuyen feature sang Inactive',
  })
  remove(@Param('id') id: string) {
    return this.featuresService.remove(id);
  }
}
