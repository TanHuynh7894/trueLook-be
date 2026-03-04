import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RxLensSpecsService } from './rx-lens-specs.service';
import { CreateRxLensSpecDto } from './dto/create-rx-lens-spec.dto';
import { UpdateRxLensSpecDto } from './dto/update-rx-lens-spec.dto';
import { ApiExcludeController } from '@nestjs/swagger';
@ApiExcludeController()
@Controller('rx-lens-specs')
export class RxLensSpecsController {
  constructor(private readonly service: RxLensSpecsService) {}

  @Post()
  create(@Body() dto: CreateRxLensSpecDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateRxLensSpecDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
