import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
@ApiTags('Support Chat')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets/:orderId/:customerId')
  @ApiOperation({ summary: 'Lấy hoặc tạo Ticket cho một đơn hàng' })
  @ApiParam({ name: 'orderId', description: 'Mã đơn hàng (VD: 1773257154796)' })
  @ApiParam({ name: 'customerId', description: 'Mã khách hàng' })
  async getTicket(
    @Param('orderId') orderId: string,
    @Param('customerId') customerId: string,
  ) {
    return await this.supportService.createOrGetTicket(orderId, customerId);
  }

  @Get('messages/:ticketId')
  @ApiOperation({ summary: 'Lấy toàn bộ lịch sử chat của một Ticket' })
  @ApiParam({ name: 'ticketId', description: 'ID của ticket (VD: 1)' })
  async getMessages(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return await this.supportService.getMessagesByTicket(ticketId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách Ticket (Có phân quyền theo Role)' })
  getAllTickets(@GetUser() user: any) {
    console.log('--- TOÀN BỘ RUỘT GAN CỦA USER TOKEN ---', user);
    return this.supportService.findAllTicketsByRole(user);
  }
}