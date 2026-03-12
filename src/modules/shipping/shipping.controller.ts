import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { HttpCode } from '@nestjs/common';
import { ApiExcludeController, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) { }
  @Get('access-token')
  async getAccessToken() {
    return this.shippingService.getAccessToken();
  }

  // @Public()
  // @Get('webhook')
  // testWebhook() {
  //   return { ok: true };
  // }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  shippingWebhook(@Body() body: any) {
    console.log('Nhanh webhook:', body);

    return {
      ok: true
    };
  }

  @Post()
  // @ApiBearerAuth('access-token')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('System Admin', 'Manager', 'Operation Staff')
  create(@Body() createShippingDto: CreateShippingDto) {
    return this.shippingService.create(createShippingDto);
  }

  @Get()
  // @ApiBearerAuth('access-token')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('System Admin', 'Manager', 'Operation Staff')
  findAll() {
    return this.shippingService.findAll();
  }

  @Get(':id')
  // @ApiBearerAuth('access-token')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('System Admin', 'Manager', 'Operation Staff')
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  // @ApiBearerAuth('access-token')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('System Admin', 'Manager', 'Operation Staff')
  update(
    @Param('id') id: string,
    @Body() updateShippingDto: UpdateShippingDto,
  ) {
    return this.shippingService.update(id, updateShippingDto);
  }

  @Delete(':id')
  // @ApiBearerAuth('access-token')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('System Admin', 'Manager', 'Operation Staff')
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }

}