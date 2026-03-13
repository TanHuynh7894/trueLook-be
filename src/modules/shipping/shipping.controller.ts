import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';

import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Shipping & Nhanh.vn')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /*
  ======================================
  1. LẤY ĐỊA ĐIỂM (PROVINCE / DISTRICT / WARD)
  ======================================
  */

  @Get('locations')
  @ApiOperation({
    summary: 'Lấy danh sách địa điểm từ Nhanh.vn',
  })
  @ApiQuery({
    name: 'type',
    enum: ['PROVINCE', 'DISTRICT', 'WARD'],
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: Number,
  })
  async getLocations(
  @Query("type") type: string,
  @Query("parentId") parentId?: number
) {

  return this.shippingService.getLocation(type, parentId);
}

  /*
  ======================================
  2. OAUTH CALLBACK
  ======================================
  */

  @Public()
  @Get('nhanh/callback')
  @ApiOperation({
    summary: 'Callback nhận accessCode từ Nhanh.vn',
  })
  async nhanhCallback(@Query('accessCode') accessCode: string) {

    if (!accessCode) {
      return { message: 'Không nhận được accessCode' };
    }

    return this.shippingService.getAccessToken(accessCode);
  }

  /*
  ======================================
  3. XEM TOKEN HIỆN TẠI
  ======================================
  */

  @Get('nhanh/token')
  @ApiOperation({
    summary: 'Xem access token hiện tại',
  })
  async getSavedToken() {
    return this.shippingService.getSavedToken();
  }

  /*
  ======================================
  4. TÍNH PHÍ SHIP
  ======================================
  */

  @Post('nhanh/fee')
  @ApiOperation({
    summary: 'Tính phí giao hàng từ Nhanh.vn',
  })
  async calculateFee(@Body() body: any) {
    return this.shippingService.calculateFee(body);
  }

  /*
  ======================================
  5. TẠO ĐƠN GIAO HÀNG
  ======================================
  */

  @Post('nhanh/create-order')
  @ApiOperation({
    summary: 'Tạo đơn giao hàng trên Nhanh.vn',
  })
  async createOrder(@Body() body: any) {
    return this.shippingService.createOrder(body);
  }

  /*
  ======================================
  6. WEBHOOK NHẬN TRẠNG THÁI
  ======================================
  */

  @Public()
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Webhook nhận trạng thái giao hàng từ Nhanh.vn',
  })
  async shippingWebhook(@Body() body: any) {

    console.log('===== NHANH WEBHOOK =====');
    console.log(body);

    return { ok: true };
  }

  /*
  ======================================
  7. CRUD SHIPPING NỘI BỘ
  ======================================
  */

  @Post()
  @ApiOperation({
    summary: 'Tạo vận đơn nội bộ',
  })
  create(@Body() createShippingDto: CreateShippingDto) {
    return this.shippingService.create(createShippingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách vận đơn nội bộ',
  })
  findAll() {
    return this.shippingService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết vận đơn',
  })
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật vận đơn',
  })
  update(
    @Param('id') id: string,
    @Body() updateShippingDto: UpdateShippingDto,
  ) {
    return this.shippingService.update(id, updateShippingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa vận đơn',
  })
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}