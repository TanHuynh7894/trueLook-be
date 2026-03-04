import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Cart Items (Sản phẩm trong giỏ)')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post('add')
  @ApiOperation({ summary: 'Khách hàng thêm sản phẩm vào giỏ (Tự động cộng dồn số lượng)' })
  addItem(@Request() req: any, @Body() createCartItemDto: CreateCartItemDto) {
    const userId = req.user.sub;
    return this.cartItemsService.addItem(userId, createCartItemDto);
  }

  @Get('my-items')
  @ApiOperation({ summary: 'Xem danh sách sản phẩm trong giỏ hàng của tôi' })
  getMyCartItems(@Request() req: any) {
    const userId = req.user.sub;
    return this.cartItemsService.getMyCartItems(userId);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Cập nhật số lượng của 1 sản phẩm trong giỏ' })
  updateQuantity(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartItemsService.updateQuantity(id, updateCartItemDto);
  }

  @Delete('remove/:id')
  @ApiOperation({ summary: 'Xóa 1 sản phẩm khỏi giỏ hàng' })
  remove(@Param('id') id: string) {
    return this.cartItemsService.remove(id);
  }
}