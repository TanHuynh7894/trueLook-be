import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './entities/support-ticket.entity';
import { ChatMessage } from './entities/chat-message.entity';

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
}