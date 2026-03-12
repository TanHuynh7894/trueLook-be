import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupportService } from './support.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/support',
})
export class SupportGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly supportService: SupportService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers['authorization'];
      const authToken = client.handshake.auth?.token;
      const rawToken = authToken || authHeader;

      if (!rawToken) {
        console.log(`[Socket] Từ chối kết nối: Không tìm thấy Token`);
        client.disconnect();
        return;
      }

      const token = rawToken.includes('Bearer ') ? rawToken.split(' ')[1] : rawToken;

      const secretKey = this.configService.get<string>('JWT_ACCESS_SECRET') || process.env.JWT_ACCESS_SECRET;
      
      if (!secretKey) {
        console.log(`[Socket] LỖI NGHIÊM TRỌNG: Không tìm thấy biến JWT_ACCESS_SECRET trong file .env`);
        client.disconnect();
        return;
      }

      // In ra để check xem có đúng chữ 'trueLook_test' không!
      console.log(`[Socket] Đang kiểm tra bằng chìa khóa: "${secretKey}"`);

      // Giải mã token
      const decoded = this.jwtService.verify(token, { secret: secretKey });

      // Phân loại người dùng
      const isStaff = decoded.roles && decoded.roles.includes('System Admin');
      
      client.data.user = {
        id: decoded.sub,
        username: decoded.username,
        role: isStaff ? 'staff' : 'customer',
      };

      console.log(`[Socket] Kết nối thành công: ${client.data.user.username} - Role: ${client.data.user.role}`);
    } catch (error) {
      console.log(`[Socket] Lỗi xác thực: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data?.user) {
      console.log(`[Socket] Đã ngắt kết nối: ${client.data.user.username}`);
    }
  }

  // 2. Tham gia vào phòng chat của đơn hàng
  @SubscribeMessage('join_ticket')
  handleJoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() ticketId: number,
  ) {
    // Chặn nếu chưa đăng nhập
    if (!client.data.user) return { status: 'error', message: 'Chưa xác thực' };

    const roomName = `ticket_${ticketId}`;
    client.join(roomName);
    console.log(`[Socket] ${client.data.user.username} đã tham gia phòng ${roomName}`);
    
    return { status: 'success', room: roomName };
  }

  // 3. Gửi và nhận tin nhắn
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { ticketId: number; message: string },
  ) {
    if (!client.data.user) return; // Chặn nếu chưa đăng nhập

    const { id: senderId, role: senderRole } = client.data.user;

    // Lưu vào Database True Look
    const savedMessage = await this.supportService.saveMessage(
      payload.ticketId,
      senderId,
      senderRole,
      payload.message,
    );

    // Bắn tin nhắn cho tất cả những người trong phòng đó
    this.server.to(`ticket_${payload.ticketId}`).emit('receive_message', savedMessage);

    return savedMessage;
  }
}