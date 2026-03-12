import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Shipping } from './entities/shipping.entity';
import { NhanhConfig } from './entities/nhanh-config.entity';

import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';

@Injectable()
export class ShippingService {

  constructor(
    @InjectRepository(Shipping)
    private shippingRepo: Repository<Shipping>,

    @InjectRepository(NhanhConfig)
    private nhanhRepo: Repository<NhanhConfig>,
  ) { }

  /*
  =============================
  CRUD SHIPPING
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
  LẤY ACCESS TOKEN TỪ ACCESS CODE (NHANH OAUTH V3)
  =====================================================
  */

  async getAccessToken(accessCode: string) {
    try {

      const response = await axios.post(
        'https://pos.open.nhanh.vn/api/oauth/access_token',
        null,
        {
          params: {
            version: '3.0',
            appId: process.env.NHANH_APP_ID,
            secretKey: process.env.NHANH_APP_SECRET,
            accessCode: accessCode,
          },
        },
      );

      console.log('===== NHANH RESPONSE =====');
      console.log(response.data);

      const data = response.data;

      if (!data || data.code !== 1) {
        throw new Error('Nhanh OAuth thất bại');
      }

      const config = this.nhanhRepo.create({
        access_token: data.accessToken,
        business_id: data.businessId,
        expires_at: data.expiredAt,
      });

      await this.nhanhRepo.save(config);

      return {
        message: 'Kết nối Nhanh thành công',
        data,
      };

    } catch (error) {

      console.log('===== NHANH ERROR =====');
      console.log(error.response?.data || error.message);

      throw error;
    }
  }

  /*
  =====================================================
  LẤY TOKEN MỚI NHẤT TỪ DATABASE
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
  GỌI API NHANH (VÍ DỤ: LẤY DANH SÁCH ĐƠN)
  =====================================================
  */

  async getNhanhOrders() {

    const config = await this.getSavedToken();

    const response = await axios.post(
      'https://pos.open.nhanh.vn/api/order/index',
      {
        version: '3.0',
        businessId: config.business_id,
        accessToken: config.access_token,
      },
    );

    return response.data;
  }

  /*
=====================================================
LẤY DANH SÁCH KHO TỪ NHANH
=====================================================
*/

  async getDepotList() {

    const config = await this.getSavedToken();

    const payload = {
      version: '3.0',
      businessId: config.business_id,
      accessToken: config.access_token,
    };

    const response = await axios.post(
      'https://pos.open.nhanh.vn/api/depot/index',
      new URLSearchParams({
        data: JSON.stringify(payload),
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data;
  }

  async getLocation(type: string, parentId?: number) {
    const config = await this.getSavedToken();

    // 1. Dựng Body y hệt cái cURL gốc của ba (chỉ có filters, không có version ngoài cùng)
    const requestData: any = {
      filters: {
        locationVersion: 'v1',
        type: type,
      }
    };
    
    // Chỉ nhét parentId vào khi cần lấy Quận/Huyện hoặc Phường/Xã
    if (parentId) {
      requestData.filters.parentId = Number(parentId); 
    }

    // [Gỡ lỗi] In ra log để ba check xem có bị thiếu appId trong file .env không nha
    console.log(`[Nhanh API] Gửi yêu cầu lấy địa điểm: ${type}`);
    console.log(`[Nhanh API] AppID: ${process.env.NHANH_APP_ID} | BusinessID: ${config.business_id}`);

    try {
      const response = await axios.post(
        'https://pos.open.nhanh.vn/v3.0/shipping/location',
        requestData, // Ném đúng cục requestData vào đây
        {
          params: {
            appId: process.env.NHANH_APP_ID, 
            businessId: config.business_id,
          },
          headers: {
            'Authorization': config.access_token, // Header y xì cURL
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log('===== NHANH LOCATION ERROR =====');
      console.log(error.response?.data || error.message);
      throw error;
    }
  }
}