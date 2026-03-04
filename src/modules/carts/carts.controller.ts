import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CartsService } from './carts.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get('my-cart')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lấy giỏ hàng của tôi (Chưa có sẽ tự động tạo)' })
  getMyCart(@Request() req: any) {
    const userId = req.user.userId; 
    return this.cartsService.getCartByUserId(userId);
  }
}