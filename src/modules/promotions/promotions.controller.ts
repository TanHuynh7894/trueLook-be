import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { SearchPromotionDto } from './dto/search-promotion.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('create')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Admin hoac Manager tao khuyen mai' })
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get('admin/findAll')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin') 
  @ApiOperation({ summary: 'Admin xem TOAN BO khuyen mai (Search bang name, money)' })
  findAllForAdmin(@Query() query: SearchPromotionDto) {
    return this.promotionsService.findAllForAdmin(query);
  }

  @Get('findAll')
  @ApiOperation({ summary: 'Manager/Khach hang xem khuyen mai ACTIVE (Search bang name, money)' })
  findAllForManager(@Query() query: SearchPromotionDto) {
    return this.promotionsService.findAllForManager(query);
  }

  @Get('findOne/:id')
  @ApiOperation({ summary: 'Xem chi tiet 1 khuyen mai' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch('update/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Cap nhat thong tin khuyen mai' })
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete('remove/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Vo hieu hoa khuyen mai (Chuyen thanh Inactive)' })
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}