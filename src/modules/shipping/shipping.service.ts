import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Shipping } from './entities/shipping.entity';
import { NhanhConfig } from './entities/nhanh-config.entity';

import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { ShippingProvidersService } from '../shipping_providers/shipping_providers.service';
import { ShippingServicesService } from '../shipping_services/shipping_services.service';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipping)
    private shippingRepo: Repository<Shipping>,

    @InjectRepository(NhanhConfig)
    private nhanhRepo: Repository<NhanhConfig>,

    private providersService: ShippingProvidersService,
    private servicesService: ShippingServicesService,
  ) {}

  /*
  =============================
  CRUD SHIPPING NỘI BỘ
  =============================
  */

  async create(dto: CreateShippingDto): Promise<Shipping> {
    const newShipping = this.shippingRepo.create(dto);
    return await this.shippingRepo.save(newShipping);
  }

  async findAll(): Promise<Shipping[]> {
    return await this.shippingRepo.find();
  }

  async findOne(id: string): Promise<Shipping> {
    const shipping = await this.shippingRepo.findOneBy({ id });

    if (!shipping) {
      throw new NotFoundException(`Shipping với ID ${id} không tồn tại`);
    }

    return shipping;
  }

  async update(id: string, dto: UpdateShippingDto): Promise<Shipping> {
    const shipping = await this.findOne(id);
    const updated = Object.assign(shipping, dto);
    return await this.shippingRepo.save(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const shipping = await this.findOne(id);
    await this.shippingRepo.remove(shipping);

    return {
      message: `Đã xóa thành công vận đơn ${id}`,
    };
  }

  /*
  =====================================================
  ĐỔI ACCESS CODE -> ACCESS TOKEN (V2)
  =====================================================
  */

  async getAccessToken(accessCode: string) {
    try {
      const response = await axios.post(
        'https://pos.open.nhanh.vn/api/oauth/access_token',
        null,
        {
          params: {
            version: '2.0',
            appId: process.env.NHANH_APP_ID,
            secretKey: process.env.NHANH_APP_SECRET,
            accessCode,
          },
        },
      );

      console.log('NHANH TOKEN RESPONSE:');
      console.log(response.data);

      if (response.data.code !== 1) {
        throw new Error(response.data.messages);
      }

      const data = response.data;

      const config = this.nhanhRepo.create({
        access_token: data.accessToken,
        business_id: data.businessId,
        expires_at: data.expiredAt,
      });

      await this.nhanhRepo.save(config);

      return {
        message: 'Connect Nhanh success',
        token: data.accessToken,
        businessId: data.businessId,
      };
    } catch (error) {
      console.log('NHANH TOKEN ERROR:');
      console.log(error.response?.data || error.message);
      throw error;
    }
  }

  /*
  =====================================================
  LẤY TOKEN MỚI NHẤT
  =====================================================
  */

  async getSavedToken() {
    const token = await this.nhanhRepo.find({
      order: { id: 'DESC' },
      take: 1,
    });

    if (!token.length) {
      throw new NotFoundException('Chưa có token Nhanh trong database');
    }

    return token[0];
  }

  /*
  =====================================================
  LẤY TỈNH / HUYỆN / XÃ (V2)
  =====================================================
  */

  async getLocation(type: string, parentId?: number) {
    const config = await this.getSavedToken();

    const queryType = type === 'PROVINCE' ? 'CITY' : type;

    const dataPayload: any = {
      type: queryType,
    };

    if (parentId) {
      dataPayload.parentId = Number(parentId);
    }

    const formPayload = new URLSearchParams();
    formPayload.append('version', '2.0');
    formPayload.append('appId', process.env.NHANH_APP_ID || '');
    formPayload.append('businessId', String(config.business_id));
    formPayload.append('accessToken', config.access_token);
    formPayload.append('data', JSON.stringify(dataPayload));

    try {
      const response = await axios.post(
        'https://pos.open.nhanh.vn/api/shipping/location',
        formPayload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log('===== NHANH LOCATION ERROR =====');
      console.log('status =', error.response?.status);
      console.log('data =', error.response?.data || error.message);
      throw error;
    }
  }

  /*
  =====================================================
  LẤY DANH SÁCH KHO (V2)
  =====================================================
  */

  async getDepots(depotId?: number) {
    const config = await this.getSavedToken();

    const formPayload = new URLSearchParams();
    formPayload.append('version', '2.0');
    formPayload.append('appId', process.env.NHANH_APP_ID || '');
    formPayload.append('businessId', String(config.business_id));
    formPayload.append('accessToken', config.access_token);
    formPayload.append(
      'data',
      JSON.stringify(depotId ? { depotId: Number(depotId) } : {}),
    );

    try {
      const response = await axios.post(
        'https://pos.open.nhanh.vn/api/store/depot',
        formPayload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log('===== NHANH DEPOT ERROR =====');
      console.log('status =', error.response?.status);
      console.log('data =', error.response?.data || error.message);
      throw error;
    }
  }

  /*
  =====================================================
  TÍNH PHÍ SHIP (V2)
  =====================================================
  */

  async calculateFee(data: any) {
    const config = await this.getSavedToken();

    const formPayload = new URLSearchParams();
    formPayload.append('version', '2.0');
    formPayload.append('appId', process.env.NHANH_APP_ID || '');
    formPayload.append('businessId', String(config.business_id));
    formPayload.append('accessToken', config.access_token);
    formPayload.append('data', JSON.stringify(data));

    try {
      const response = await axios.post(
        'https://pos.open.nhanh.vn/api/shipping/fee',
        formPayload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log('===== NHANH FEE ERROR =====');
      console.log('status =', error.response?.status);
      console.log('data =', error.response?.data || error.message);
      throw error;
    }
  }

  /*
  =====================================================
  TẠO ĐƠN GIAO HÀNG (V2)
  =====================================================
  */

  async createOrder(data: any) {
    const config = await this.getSavedToken();

    const formPayload = new URLSearchParams();
    formPayload.append('version', '2.0');
    formPayload.append('appId', process.env.NHANH_APP_ID || '');
    formPayload.append('businessId', String(config.business_id));
    formPayload.append('accessToken', config.access_token);
    // Ép kiểu JSON string cho chắc cú, đề phòng truyền object vào bị lỗi
    formPayload.append('data', typeof data === 'string' ? data : JSON.stringify(data));

    try {
      const response = await axios.post(
        'https://pos.open.nhanh.vn/api/order/add',
        formPayload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const responseData = response.data;

      // ĐIỂM TỬ HUYỆT: Nhanh.vn trả về 200 OK nhưng logic bị lỗi (code = 0)
      if (responseData.code === 0) {
        console.error('===== NHANH.VN LOGIC ERROR =====', responseData.messages);
        // Quăng lỗi ra ngoài kèm theo thông báo từ Nhanh.vn
        throw new Error(responseData.messages ? responseData.messages.join(', ') : 'Lỗi không xác định từ Nhanh.vn');
      }

      // Nếu code = 1 (Thành công), trả về cục data chứa orderId và trackingUrl
      return responseData.data; 
    } catch (error) {
      console.log('===== NHANH CREATE ORDER ERROR =====');
      console.log(error.message);
      throw error; // Ném lỗi văng ra ngoài để Controller xử lý
    }
  }

  /*
  =====================================================
  LẤY DANH SÁCH ĐƠN HÀNG (V2) - TỪ NHANH.VN
  =====================================================
  */
  async getNhanhOrders(data: any) {
    const config = await this.getSavedToken();

    const formPayload = new URLSearchParams();
    formPayload.append('version', '2.0');
    formPayload.append('appId', process.env.NHANH_APP_ID || '');
    formPayload.append('businessId', String(config.business_id));
    formPayload.append('accessToken', config.access_token);
    formPayload.append('data', typeof data === 'string' ? data : JSON.stringify(data));

    try {
      const response = await axios.post(
        'https://pos.open.nhanh.vn/api/order/index',
        formPayload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const responseData = response.data;

      // Xử lý logic khi Nhanh.vn báo code = 0
      if (responseData.code === 0) {
        
        // 1. Nếu đơn giản là "Không có đơn hàng", trả về mảng rỗng cho frontend
        if (responseData.messages && responseData.messages.includes('No records')) {
          console.log('[Nhanh.vn] Không có đơn hàng nào trong khoảng thời gian này.');
          return {
            totalPages: 0,
            orders: {} // Nhanh.vn thường trả về object chứa các đơn, hoặc mảng
          };
        }

        // 2. Nếu là lỗi thật sự (Sai token, thiếu tham số...) thì ném lỗi 400
        console.error('===== NHANH.VN GET ORDERS ERROR =====', responseData.messages);
        throw new BadRequestException(
          responseData.messages ? responseData.messages.join(', ') : 'Lỗi lấy danh sách đơn từ Nhanh.vn'
        );
      }

      // Trả về danh sách đơn hàng bình thường nếu có dữ liệu
      return responseData.data;
    } catch (error) {
      console.log('===== NHANH GET ORDERS CATCH ERROR =====');
      console.log(error.message);
      
      // Giữ nguyên lỗi 400 nếu mình chủ động ném ra ở trên
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(error.response?.data || error.message);
    }
  }

  async updateNhanhOrder(data: any) {
    const config = await this.getSavedToken();

    const formPayload = new URLSearchParams();
    formPayload.append('version', '2.0');
    formPayload.append('appId', process.env.NHANH_APP_ID || '');
    formPayload.append('businessId', String(config.business_id));
    formPayload.append('accessToken', config.access_token);
    // Parse data JSON y như hình Postman của ông
    formPayload.append('data', typeof data === 'string' ? data : JSON.stringify(data));

    try {
      const response = await axios.post(
        'https://pos.open.nhanh.vn/api/order/update',
        formPayload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const responseData = response.data;

      // Vẫn là cái bẫy quen thuộc: HTTP 200 nhưng code = 0
      if (responseData.code === 0) {
        console.error('===== NHANH.VN UPDATE ORDER ERROR =====', responseData.messages);
        throw new BadRequestException(
          responseData.messages ? responseData.messages.join(', ') : 'Lỗi cập nhật đơn trên Nhanh.vn'
        );
      }

      // Trả về data (chứa orderId và status mới)
      return responseData.data;
    } catch (error) {
      console.log('===== NHANH UPDATE ORDER CATCH ERROR =====');
      console.log(error.message);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(error.response?.data || error.message);
    }
  }

  async processCheckoutShipping(
    orderId: string, 
    providerId: string, 
    serviceId: string, 
    nhanhPayload: any
  ) {
    // 1. Validate xem Provider và Service có tồn tại trong DB nội bộ không
    // (Logic check tồn tại viết bên service của nó)
    const provider = await this.providersService.findOne(providerId);
    const service = await this.servicesService.findOne(serviceId);

    if (!provider || !service) {
      throw new BadRequestException('Hãng vận chuyển hoặc Dịch vụ không hợp lệ');
    }

    // 2. Bắn data qua Nhanh.vn (Kèm CarrierId và ServiceId của Nhanh nếu cần)
    const nhanhResult = await this.createOrder(nhanhPayload);

    // 3. Nhanh.vn báo OK -> Lưu dữ liệu tổng hợp vào bảng `shipping`
    const newShipping = this.shippingRepo.create({
      id: orderId, // Hoặc tự gen ID vận đơn riêng tùy ông
      order_id: orderId,
      provider_id: provider.id,
      service_id: service.id,
      ship_fee: nhanhResult.shipFee || 0,
      cod_amount: nhanhPayload.codMoney || 0, 
      status: 'ReadyToPick', // Trạng thái mặc định khi vừa book xong
      // Lưu lại 2 trường tracking nếu ông đã tạo trong entity
      // nhanh_id: String(nhanhResult.orderId), 
      // tracking_url: nhanhResult.trackingUrl,
    });

    // 4. Lưu thành công và trả về cho Frontend
    return await this.shippingRepo.save(newShipping);
  }
  
  /*
  =====================================================
  XỬ LÝ WEBHOOK TỪ NHANH.VN BÁO VỀ (TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI)
  =====================================================
  */
  async handleNhanhWebhook(payload: any) {
    console.log('===== NHANH WEBHOOK GÕ CỬA =====', payload);

    const nhanhOrderId = payload.data?.orderId || payload.orderId;
    const nhanhStatus = payload.data?.status || payload.status;

    if (!nhanhOrderId || !nhanhStatus) {
      return { message: 'Dữ liệu webhook không hợp lệ, bỏ qua!' };
    }

    // 1. Tìm đơn hàng nội bộ qua nhanh_id
    // LƯU Ý: Entity Shipping của ông phải có cột `nhanh_id` nhé
    const shippingRecord = await this.shippingRepo.findOne({
      where: { nhanh_id: String(nhanhOrderId) } as any // Ép kiểu any tạm nếu Entity chưa khai báo nhanh_id
    });

    if (!shippingRecord) {
      console.log(`[Webhook] Không tìm thấy đơn nội bộ nào khớp với mã Nhanh.vn: ${nhanhOrderId}`);
      return { message: 'Không tìm thấy đơn' };
    }

    // 2. Map trạng thái của Nhanh.vn sang trạng thái nội bộ
    let localStatus = shippingRecord.status;
    switch (nhanhStatus) {
      case 'Pickup': 
        localStatus = 'Delivering'; 
        break;
      case 'Success': 
        localStatus = 'Delivered'; 
        break;
      case 'Returned': 
        localStatus = 'Returned';
        break;
      case 'Canceled': 
      case 'Aborted':
        localStatus = 'Canceled';
        break;
    }

    // 3. Cập nhật DB
    shippingRecord.status = localStatus;
    shippingRecord.update_at = new Date(); 
    
    await this.shippingRepo.save(shippingRecord);
    
    console.log(`[Webhook] Đã tự động cập nhật đơn ${shippingRecord.id} -> ${localStatus}`);
    return { success: true };
  }

  /*
  =====================================================
  TẠO ĐƠN NHANH.VN & TỰ ĐỘNG LƯU VÀO 3 BẢNG DB (BẢN FIX LỖI DUPLICATE)
  =====================================================
  */
  async saveAllDataToDb(body: any) {
    // --- 1. XỬ LÝ PROVIDER ---
    const carrierId = body.carrierId ? String(body.carrierId) : '1';
    const carrierName = body.carrierName || 'J&T Express';
    const carrierCode = carrierName.toUpperCase().replace(/\s/g, '_');

    let provider;
    // Tìm theo ID trước
    provider = await this.providersService.findOne(carrierId).catch(() => null);

    // Nếu ID ko có, gọi hàm findByCode vừa tạo ở Bước 1
    if (!provider) {
      provider = await this.providersService.findByCode(carrierCode).catch(() => null);
    }

    // Nếu vẫn ko có thì mới tạo mới
    if (!provider) {
      provider = await this.providersService.create({
        id: carrierId,
        name: carrierName,
        code: carrierCode,
        status: 'Active'
      } as any);
      console.log('=> Tạo mới Provider thành công');
    }

    // --- 2. XỬ LÝ SERVICE ---
    const serviceId = body.serviceId ? String(body.serviceId) : '1';
    const serviceName = body.serviceName || 'Giao chuẩn';
    const serviceCode = serviceName.toUpperCase().replace(/\s/g, '_');

    let service;
    // Tìm theo ID
    service = await this.servicesService.findOne(serviceId).catch(() => null);

    // Tìm theo Code bằng hàm vừa tạo ở Bước 2
    if (!service) {
      service = await this.servicesService.findByCode(serviceCode).catch(() => null);
    }

    if (!service) {
      service = await this.servicesService.create({
        id: serviceId,
        name: serviceName,
        service_code: serviceCode,
        status: 'Active'
      } as any);
      console.log('=> Tạo mới Service thành công');
    }

    // --- 3. BẮN DATA SANG NHANH.VN ---
    const nhanhResult = await this.createOrder(body);

    // --- 4. LƯU THÔNG TIN VẬN ĐƠN (SHIPPING) ---
    const newShipping = this.shippingRepo.create({
      id: body.id,
      order_id: body.id,
      status: 'ReadyToPick',
      ship_fee: nhanhResult.shipFee || 0,
      cod_amount: body.moneyTransfer === 0 
        ? body.productList.reduce((sum: number, p: any) => sum + p.price * p.quantity, 0) 
        : 0,
      nhanh_id: String(nhanhResult.orderId),
      tracking_url: nhanhResult.trackingUrl,
      provider_id: provider.id,
      service_id: service.id
    } as any);

    const savedShipping = await this.shippingRepo.save(newShipping);

    return {
      message: 'Done! Hệ thống True Look đã ghi nhận đủ 3 bảng.',
      db_shipping: savedShipping
    };
  }

  async updateStatusFromWebhook(orderId: string, status: string) {
  return await this.shippingRepo.update(
    { nhanh_id: String(orderId) },
    { status: status }
  );
}

}
