import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Addresses')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('api/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách địa chỉ (Join addresses với user_id hiện tại)',
  })
  findAll(@Req() req: any) {
    const userId = req.user.sub;
    return this.addressesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sổ địa chỉ mới' })
  create(@Req() req: any, @Body() createAddressDto: CreateAddressDto) {
    const userId = req.user.sub;
    return this.addressesService.create(userId, createAddressDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa địa chỉ' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const userId = req.user.sub;
    return this.addressesService.update(userId, id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa địa chỉ' })
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.addressesService.remove(userId, id);
  }
}
