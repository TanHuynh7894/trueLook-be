import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { SupportTicket } from './entities/support-ticket.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportGateway } from './support.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicket, ChatMessage]),
    ConfigModule,
    JwtModule.register({}), 
  ],
  controllers: [SupportController],
  providers: [SupportService, SupportGateway],
})
export class SupportModule {}