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
  ĐỔI ACCESS CODE -> ACCESS TOKEN (OAUTH V3)
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

      console.log("NHANH TOKEN RESPONSE:");
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
        message: "Connect Nhanh success",
        token: data.accessToken,
      };

    } catch (error) {

      console.log("NHANH TOKEN ERROR:");
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
  LẤY TỈNH / HUYỆN / XÃ
  =====================================================
  */

  async getLocation(type: string, parentId?: number) {

  const config = await this.getSavedToken();

  const filters: any = {
    locationVersion: "v1",
    type: type
  };

  if (parentId) {
    filters.parentId = Number(parentId);
  }

  const payload = {
    filters: filters
  };

  const key = `${JSON.stringify(filters)}`;
  console.log("CACHE KEY:", key);

  try {

    const response = await axios.post(
      "https://pos.open.nhanh.vn/v3.0/shipping/location",
      payload,
      {
        params: {
          version: 'v3',
          appId: process.env.NHANH_APP_ID,
          businessId: config.business_id
        },
        headers: {
          Authorization: config.access_token,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {

    console.log("===== NHANH LOCATION ERROR =====");
    console.log(error.response?.data || error.message);

    throw error;
  }
}

  /*
  =====================================================
  TÍNH PHÍ SHIP
  =====================================================
  */

  async calculateFee(data: any) {

    const config = await this.getSavedToken();

    try {

      const response = await axios.post(
        'https://pos.open.nhanh.vn/v3.0/shipping/fee',
        { filters: data },
        {
          params: {
            version: '3.0',
            appId: process.env.NHANH_APP_ID,
            businessId: config.business_id,
          },
          headers: {
            Authorization: config.access_token,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;

    } catch (error) {

      console.log('===== NHANH FEE ERROR =====');
      console.log(error.response?.data || error.message);

      throw error;
    }
  }

  /*
  =====================================================
  TẠO ĐƠN GIAO HÀNG
  =====================================================
  */

  async createOrder(data: any) {

    const config = await this.getSavedToken();

    try {

      const response = await axios.post(
        'https://pos.open.nhanh.vn/v3.0/order/create',
        { filters: data },
        {
          params: {
            version: '3.0',
            appId: process.env.NHANH_APP_ID,
            businessId: config.business_id,
          },
          headers: {
            Authorization: config.access_token,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;

    } catch (error) {

      console.log('===== NHANH CREATE ORDER ERROR =====');
      console.log(error.response?.data || error.message);

      throw error;
    }
  }
}