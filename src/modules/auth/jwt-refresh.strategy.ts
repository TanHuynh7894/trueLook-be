import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      // Lấy token từ header: Authorization: Bearer <refresh_token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET_KEY', 
      passReqToCallback: true, 
    });
  }

  async validate(req: Request, payload: any) {
    const authorization = req.get('Authorization');
    if (!authorization) throw new UnauthorizedException('Không tìm thấy Refresh Token');

    const refreshToken = authorization.replace('Bearer', '').trim();
    
    // Trả về payload kèm theo chính cái chuỗi token đó để lát đem so sánh với DB
    return { ...payload, refreshToken };
  }
}