import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ContactLensAxisService } from './contact_lens_axis.service';
import { CreateContactLensAxisDto } from './dto/create-contact_lens_axis.dto';
import { UpdateContactLensAxisDto } from './dto/update-contact_lens_axis.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('contact-lens-axis')
export class ContactLensAxisController {
  constructor(private readonly service: ContactLensAxisService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'System Admin hoac Manager tao contact lens axis' })
  create(@Body() dto: CreateContactLensAxisDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({
    summary: 'System Admin hoac Manager cap nhat contact lens axis',
  })
  update(@Param('id') id: string, @Body() dto: UpdateContactLensAxisDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'System Admin hoac Manager xoa contact lens axis' })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
