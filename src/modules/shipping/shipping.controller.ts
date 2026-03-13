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
import { ApiOperation, ApiQuery, ApiTags, ApiBody, ApiOkResponse } from '@nestjs/swagger';

import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';

import { Public } from 'src/common/decorators/public.decorator';
import { GetDepotsQueryDto } from './dto/get-depots-query.dto';
import { CreateNhanhOrderDto } from './dto/create-nhanh-order.dto';

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

  @Get('nhanh/depots')
  @ApiOperation({
    summary: 'Lấy danh sách kho từ Nhanh.vn (chuẩn V2)',
  })
  @ApiQuery({
    name: 'depotId',
    required: false,
    type: Number,
    description: 'ID kho. Bỏ trống để lấy tất cả kho.',
  })
  async getDepots(@Query() query: GetDepotsQueryDto) {
    return await this.shippingService.getDepots(query.depotId);
  }

  /*
  ======================================
  5. TẠO ĐƠN GIAO HÀNG
  ======================================
  */

  @Post('nhanh/create-order')
  @ApiOperation({ summary: 'Tạo đơn giao hàng trên Nhanh.vn' })
  @ApiBody({
    type: CreateNhanhOrderDto, // Nhớ đảm bảo DTO của ông khớp với các trường này nha
    examples: {
      testOnly: {
        summary: 'Tạo đơn test, không book thật',
        value: {
          id: 'ORDER_TEST_003',
          carrierId: 9,
          carrierName: "J&T Express",
          serviceId: 1,
          serviceName: "Giao hàng tiêu chuẩn",
          depotId: 230531,
          customerName: 'Nguyen Van A',
          customerMobile: '0987654321',
          customerAddress: '123 Nguyen Hue',
          customerCityName: 'Hồ Chí Minh',
          customerDistrictName: 'Quận 1',
          moneyTransfer: 0,
          productList: [
            {
              id: 'SP001',
              name: 'San pham test',
              code: 'SP001',
              quantity: 1,
              price: 500000,
              weight: 200,
            },
          ],
        },
      },
    },
  })
  async createNhanhOrder(@Body() body: any) {
    // Chỉ việc gọi cái hàm vạn năng mình vừa viết
    return this.shippingService.saveAllDataToDb(body);
  
  }

  @Post('nhanh/orders')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng từ Nhanh.vn (Tra cứu/Đồng bộ)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fromDate: { type: 'string', description: 'Từ ngày (YYYY-MM-DD)' },
        toDate: { type: 'string', description: 'Đến ngày (YYYY-MM-DD)' },
        type: { type: 'string', description: 'Loại đơn (Shipping, Shopee, Lazada...)' },
        status: { type: 'string', description: 'Trạng thái (New, Pickup, Success...)' }
      },
      example: {
        fromDate: '2025-03-13',
        toDate: '2025-03-22',
      },
    },
  })
  async getNhanhOrders(@Body() body: any) {
    return this.shippingService.getNhanhOrders(body);
  }


  @Post('nhanh/update-order')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng trên Nhanh.vn' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID đơn hàng nội bộ (VD: ORDER_TEST_001)' },
        status: { type: 'string', description: 'Trạng thái muốn cập nhật (VD: Success, Aborted, Returned...)' }
      },
      example: {
        id: 'ORDER_TEST_001',
        status: 'Success',
      },
    },
  })
  async updateNhanhOrder(@Body() body: any) {
    return this.shippingService.updateNhanhOrder(body);
  }

  /*
  ======================================
  6. WEBHOOK NHẬN TRẠNG THÁI
  ======================================
  */
  @Public()
  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    console.log('===== NHANH WEBHOOK GÕ CỬA =====');
    const eventType = payload.event; // Lấy loại sự kiện

    switch (eventType) {
      case 'orderUpdate': // Hoặc 'orderStatusChange' tùy Nhanh.vn
      case 'orderAdd':
        const orderId = payload.data?.orderId || payload.orderId;
        const status = payload.data?.status || payload.status;
        
        if (orderId && status) {
          await this.shippingService.updateStatusFromWebhook(orderId, status);
          console.log(`[Order] Đã cập nhật đơn ${orderId} sang: ${status}`);
        }
        break;

      case 'inventoryChange':
        console.log('[Inventory] Kho hàng vừa thay đổi, ông có muốn trừ kho trong DB mình luôn không?');
        // Logic xử lý trừ tồn kho nội bộ ở đây nếu cần
        break;

      default:
        console.log(`[Webhook] Nhận sự kiện lạ: ${eventType}`);
    }

    return { code: 1, message: 'Success' };
  }
  // @Public()
  // @Post('webhook')
  // @HttpCode(200)
  // @ApiOperation({
  //   summary: 'Webhook nhận trạng thái giao hàng từ Nhanh.vn',
  // })
  // async shippingWebhook(@Body() body: any) {
  //   console.log('===== NHANH WEBHOOK =====');
  //   console.log(body);
  //   // Xử lý logic cập nhật trạng thái đơn hàng nội bộ ở đây
  //   return { ok: true };
  // }

  @Post('checkout')
  @ApiOperation({ summary: 'Tạo đơn nội bộ & Book ship tự động qua Nhanh.vn' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'ID đơn hàng (VD: ORDER_001)' },
        providerId: { type: 'string', description: 'ID Hãng vận chuyển (trong DB nội bộ, VD: "5" cho J&T)' },
        serviceId: { type: 'string', description: 'ID Gói cước (trong DB nội bộ, VD: "7" cho Giao chuẩn)' },
        nhanhPayload: { 
          type: 'object', 
          description: 'Cục data JSON chứa thông tin khách, địa chỉ, cân nặng (y như gửi Postman)' 
        }
      }
    }
  })
  async checkoutShipping(@Body() body: any) {
    const { orderId, providerId, serviceId, nhanhPayload } = body;
    return this.shippingService.processCheckoutShipping(
      orderId, 
      providerId, 
      serviceId, 
      nhanhPayload
    );
  }
}