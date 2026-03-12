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
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'; // Thêm ApiTags
import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Shipping & Nhanh.vn') // Gom nhóm lại trên Swagger cho đẹp
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /*
  ======================================
  1. DANH SÁCH ĐỊA ĐIỂM (STATIC ROUTE)
  ======================================
  Đưa lên đây để tránh bị trùng với @Get(':id')
  */
  @Get('locations')
  @ApiOperation({ 
    summary: 'Lấy danh sách địa điểm (Tỉnh/Huyện/Xã) từ Nhanh.vn',
    description: 'Kết nối trực tiếp với API Nhanh V3.0' 
  })
  @ApiQuery({ name: 'type', enum: ['PROVINCE', 'DISTRICT', 'WARD'], description: 'Loại địa điểm' })
  @ApiQuery({ name: 'parentId', required: false, type: Number, description: 'ID của cấp cha' })
  async getLocations(
    @Query('type') type: 'PROVINCE' | 'DISTRICT' | 'WARD',
    @Query('parentId') parentId?: number,
  ) {
    return await this.shippingService.getLocation(type, parentId);
  }

  /*
  ======================================
  2. NHANH.VN OAUTH & TOKEN
  ======================================
  */
  @Public()
  @Get('nhanh/callback')
  @ApiOperation({ summary: 'Callback nhận Access Code từ Nhanh.vn' })
  async nhanhCallback(@Query('accessCode') accessCode: string) {
    if (!accessCode) return { message: 'Không nhận được accessCode' };
    return await this.shippingService.getAccessToken(accessCode);
  }

  @Get('nhanh/depot')
  @ApiOperation({ summary: 'Lấy danh sách kho hàng từ Nhanh.vn' })
  async getNhanhDepot() {
    return this.shippingService.getDepotList();
  }

  @Get('nhanh/token')
  @ApiOperation({ summary: 'Xem Token Nhanh hiện tại trong Database' })
  async getSavedToken() {
    return this.shippingService.getSavedToken();
  }

  @Get('nhanh/orders')
  @ApiOperation({ summary: 'Test lấy danh sách đơn hàng từ Nhanh.vn' })
  async getNhanhOrders() {
    return this.shippingService.getNhanhOrders();
  }

  /*
  ======================================
  3. WEBHOOK (EXTERNAL)
  ======================================
  */
  @Public()
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook nhận thông báo từ Nhanh.vn' })
  shippingWebhook(@Body() body: any) {
    console.log('Nhanh webhook received:', body);
    // Xử lý logic webhook ở đây...
    return { ok: true };
  }

  /*
  ======================================
  4. CRUD SHIPPING (DYNAMIC ROUTES)
  ======================================
  Mấy cái có :id phải nằm ở cuối cùng của file
  */
  @Post()
  @ApiOperation({ summary: 'Tạo mới một vận đơn trong DB nội bộ' })
  create(@Body() createShippingDto: CreateShippingDto) {
    return this.shippingService.create(createShippingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách vận đơn nội bộ' })
  findAll() {
    return this.shippingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết 1 vận đơn nội bộ theo ID' })
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin vận đơn' })
  update(
    @Param('id') id: string,
    @Body() updateShippingDto: UpdateShippingDto,
  ) {
    return this.shippingService.update(id, updateShippingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa vận đơn' })
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}