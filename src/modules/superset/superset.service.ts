import { Injectable, HttpException, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SupersetService {
  private readonly logger = new Logger(SupersetService.name);
  private client: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.client = axios.create({
      baseURL: `${this.configService.get<string>('SUPERSET_URL')}/api/v1`,
      timeout: 30000,
    });
  }

  /**
   * Bước 1: Lấy Access Token từ Keycloak bằng Client Credentials
   * Sử dụng thông tin truelook-api trong .env của bạn
   */
  private async getAccessToken(): Promise<string> {
    try {
      const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID')!;
      const clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET')!;
      const tokenUrl = this.configService.get<string>('KEYCLOAK_TOKEN_URL')!;

      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const response = await axios.post(
        tokenUrl,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Không thể lấy Token từ Keycloak', error.stack);
      
      // QUAN TRỌNG: Bạn phải throw lỗi ở đây để TypeScript hiểu rằng 
      // nếu không return được string thì hàm sẽ kết thúc bằng một Error
      throw new HttpException(
        'Lỗi xác thực với Keycloak hệ thống',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
  /**
   * Bước 2: Lấy dữ liệu biểu đồ (Data thực tế) từ Chart ID
   */
  async getChartData(chartId: number) {
    try {
      const token = await this.getAccessToken();
      const authHeader = { Authorization: `Bearer ${token}` };

      // 1. Lấy Metadata để lấy query_context
      const metadata = await this.client.get(`/chart/${chartId}`, {
        headers: authHeader,
      });

      const queryContext = JSON.parse(metadata.data.result.query_context);

      // 2. Gọi API lấy data thực tế
      const dataResponse = await this.client.post('/chart/data', queryContext, {
        headers: authHeader,
      });

      // Trả về kết quả tinh gọn
      return {
        id: chartId,
        name: metadata.data.result.slice_name,
        type: metadata.data.result.viz_type,
        data: dataResponse.data.result[0].data,
        columns: dataResponse.data.result[0].colnames,
      };
    } catch (error) {
      this.logger.error(`Lỗi lấy dữ liệu Chart ${chartId}`, error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Lỗi kết nối Superset',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Lấy link login cho Frontend
   */
  getSsoLink() {
    return { url: `${this.configService.get('SUPERSET_URL')}/login/keycloak` };
  }
}