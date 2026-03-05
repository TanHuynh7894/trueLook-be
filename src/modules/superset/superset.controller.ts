import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SupersetService } from './superset.service';
import { CreateSupersetDto } from './dto/create-superset.dto';
import { UpdateSupersetDto } from './dto/update-superset.dto';

@Controller('superset')
export class SupersetController {
  constructor(private readonly supersetService: SupersetService) {}

  @Post()
  create(@Body() createSupersetDto: CreateSupersetDto) {
    return this.supersetService.create(createSupersetDto);
  }

  @Get()
  findAll() {
    return this.supersetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supersetService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupersetDto: UpdateSupersetDto) {
    return this.supersetService.update(+id, updateSupersetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supersetService.remove(+id);
  }
}
