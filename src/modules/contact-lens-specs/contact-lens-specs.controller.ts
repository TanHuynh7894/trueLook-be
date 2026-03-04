import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContactLensSpecsService } from './contact-lens-specs.service';
import { CreateContactLensSpecDto } from './dto/create-contact-lens-spec.dto';
import { UpdateContactLensSpecDto } from './dto/update-contact-lens-spec.dto';
import { ApiExcludeController } from '@nestjs/swagger';
@ApiExcludeController()
@Controller('contact-lens-specs')
export class ContactLensSpecsController {
  constructor(private readonly service: ContactLensSpecsService) {}

  @Post()
  create(@Body() dto: CreateContactLensSpecDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactLensSpecDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
