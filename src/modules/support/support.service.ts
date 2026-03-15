import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './entities/support-ticket.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
  ) {}

  async createOrGetTicket(orderId: string, customerId: string): Promise<SupportTicket> {
    let ticket = await this.ticketRepository.findOne({
      where: { orderId, customerId, status: 'open' },
    });

    if (!ticket) {
      ticket = this.ticketRepository.create({ orderId, customerId });
      await this.ticketRepository.save(ticket);
    }
    return ticket;
  }

  async saveMessage(
    ticketId: number,
    senderId: string,
    senderRole: 'customer' | 'staff',
    message: string,
  ): Promise<ChatMessage> {
    const newMessage = this.messageRepository.create({
      ticketId,
      senderId,
      senderRole,
      message,
    });
    return await this.messageRepository.save(newMessage);
  }

  async getMessagesByTicket(ticketId: number): Promise<ChatMessage[]> {
    return await this.messageRepository.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
    });
  }

  async findAllTicketsByRole(user: any) {
    const userId = user.sub; 
    
    // 1. Lấy đúng mảng roles từ payload Token của ông
    const userRoles = user.roles || []; 

    // 2. Nhóm quyền lực
    const adminRoles = ['System Admin', 'Sales Staff', 'Operation Staff', 'Manager'];
    
    // Kiểm tra: Nếu user có BẤT KỲ role nào trùng với nhóm Admin thì cho qua
    const isAdmin = userRoles.some((role: string) => adminRoles.includes(role));

    if (isAdmin) {
      console.log('=> Cửa VIP mở: Chào mừng Admin/Staff!');
      return await this.ticketRepository.find({
        order: { id: 'DESC' }
      });
    }

    // 3. Nhóm Khách hàng (Kiểm tra xem mảng roles có chữ Customer không)
    if (userRoles.includes('Customer')) {
      console.log('=> Cửa thường: Chào mừng Khách hàng!');
      return await this.ticketRepository.find({
        where: { customerId: String(userId) }, // (Nhớ dùng đúng chữ customerId giống ban nãy ông fix nha)
        order: { id: 'DESC' }
      });
    }

    // 4. Nếu mảng roles trống trơn hoặc chứa role lạ hoắc
    throw new ForbiddenException('Bạn không có quyền xem danh sách Ticket này!');
  }
}