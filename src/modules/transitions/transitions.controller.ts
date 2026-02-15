import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransitionsService } from './transitions.service';
import { CreateTransitionDto } from './dto/create-transition.dto';
import { UpdateTransitionDto } from './dto/update-transition.dto';

@Controller('transitions')
export class TransitionsController {
  constructor(private readonly transitionsService: TransitionsService) {}

  @Post()
  create(@Body() createDto: CreateTransitionDto) {
    return this.transitionsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.transitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transitionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateTransitionDto) {
    return this.transitionsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transitionsService.remove(id);
  }
}