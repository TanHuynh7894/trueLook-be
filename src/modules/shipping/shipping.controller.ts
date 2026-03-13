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
import { ApiOperation, ApiQuery, ApiTags, ApiBody } from '@nestjs/swagger';

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
  1. LẤY ĐỊA ĐIỂM (CITY / DISTRICT / WARD)
  ======================================
  */

  @Get('locations')
  @ApiOperation({
    summary: 'Lấy danh sách địa điểm từ Nhanh.vn (Chuẩn V2)',
    description: 'Lưu ý: Nhanh V2 dùng CITY thay vì PROVINCE cho Tỉnh/Thành phố.'
  })
  @ApiQuery({
    name: 'type',
    enum: ['CITY', 'DISTRICT', 'WARD'], // Cập nhật enum theo chuẩn V2
    description: 'Loại địa điểm cần lấy'
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: Number,
    description: 'Bỏ trống nếu lấy CITY. Nhập ID Tỉnh nếu lấy DISTRICT. Nhập ID Huyện nếu lấy WARD.'
  })
  async getLocations(
    @Query('type') type: string,
    @Query('parentId') parentId?: number,
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
    summary: 'Xem access token hiện tại đang lưu trong DB',
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
  @ApiBody({
    description: 'Payload tính phí mẫu (Dựa theo Docs V2)',
    schema: {
      example: {
        fromCityName: "Hà Nội",
        fromDistrictName: "Quận Đống Đa",
        toCityName: "Hồ Chí Minh",
        toDistrictName: "Quận 1",
        shippingWeight: 500,
        money: 150000
      }
    }
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
  @ApiBody({
    description: 'Dữ liệu tạo đơn mẫu (Gửi vào biến data của Nhanh)',
    schema: {
      example: {
        id: "ORDER_123",
        depotId: 12345,
        customerName: "Nguyễn Văn A",
        customerMobile: "0987654321",
        customerCityName: "Hà Nội",
        customerDistrictName: "Quận Cầu Giấy",
        customerAddress: "Số 1, ngõ 2, đường 3",
        weight: 200,
        money: 500000
      }
    }
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
    // Xử lý logic cập nhật trạng thái đơn hàng nội bộ ở đây
    return { ok: true };
  }

  /*
  ======================================
  7. CRUD SHIPPING NỘI BỘ (Để cuối file)
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
    summary: 'Lấy chi tiết vận đơn theo ID',
  })
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật vận đơn nội bộ',
  })
  update(
    @Param('id') id: string,
    @Body() updateShippingDto: UpdateShippingDto,
  ) {
    return this.shippingService.update(id, updateShippingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa vận đơn nội bộ',
  })
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}