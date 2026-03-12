import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactLensSpecsService } from './contact-lens-specs.service';
import { CreateContactLensSpecDto } from './dto/create-contact-lens-spec.dto';
import { UpdateContactLensSpecDto } from './dto/update-contact-lens-spec.dto';
import { ContactLensSpecSearchQueryDto } from './dto/contact-lens-spec-search-query.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('contact-lens-specs')
export class ContactLensSpecsController {
  constructor(private readonly service: ContactLensSpecsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  @ApiOperation({
    summary:
      'System Admin hoac Manager tao contact lens spec (co ho tro axis_min)',
  })
  create(@Body() dto: CreateContactLensSpecDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  @ApiOperation({
    summary:
      'Tim contact lens specs theo product_name, base_curve, diameter, sphere_min/sphere_max, cylinder_min/cylinder_max, axis',
  })
  findAll(@Query() query: ContactLensSpecSearchQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  @ApiOperation({
    summary:
      'System Admin hoac Manager cap nhat contact lens spec (product_id, base_curve, diameter, min_sphere, max_sphere, min_cylinder, max_cylinder, status, axis_min)',
  })
  update(@Param('id') id: string, @Body() dto: UpdateContactLensSpecDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  @ApiOperation({ summary: 'System Admin hoac Manager xoa contact lens spec' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
