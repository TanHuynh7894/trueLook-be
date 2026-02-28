import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FrameSpecsService } from './frame-specs.service';
import { CreateFrameSpecDto } from './dto/create-frame-spec.dto';
import { UpdateFrameSpecDto } from './dto/update-frame-spec.dto';
import { ApiExcludeController } from '@nestjs/swagger';
@ApiExcludeController()
@Controller('frame-specs')
export class FrameSpecsController {
  constructor(private readonly service: FrameSpecsService) {}

  @Post()
  create(@Body() dto: CreateFrameSpecDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateFrameSpecDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}