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
      this.logger.error('Không thể lấy Token từ Keycloak', error?.stack);
      
      // QUAN TRỌNG: Bạn phải throw lỗi ở đây để TypeScript hiểu rằng 
      // nếu không return được string thì hàm sẽ kết thúc bằng một Error
      throw new HttpException(
        'Lỗi xác thực với Keycloak hệ thống',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Lấy danh sách toàn bộ Dashboards
   */
  async getDashboards() {
    try {
      const token = await this.getAccessToken();
      const authHeader = { Authorization: `Bearer ${token}` };

      // Cấu hình query để lấy tối đa 100 dashboards và chỉ lấy các cột cần thiết
      const queryParams = JSON.stringify({
        page_size: 100, 
        columns: ['id', 'dashboard_title', 'published', 'url', 'changed_by.first_name', 'changed_by.last_name']
      });

      const response = await this.client.get('/dashboard/', {
        headers: authHeader,
        params: { q: queryParams }, // Superset dùng tham số 'q' dạng chuỗi JSON
      });

      // Map lại dữ liệu cho đẹp trước khi trả về Frontend
      return response.data.result.map((dash: any) => ({
        id: dash.id,
        title: dash.dashboard_title,
        isPublished: dash.published,
        url: `${this.configService.get('SUPERSET_URL')}${dash.url}`, // Link xem trực tiếp
        author: dash.changed_by ? `${dash.changed_by.first_name} ${dash.changed_by.last_name}`.trim() : 'Unknown',
      }));
    } catch (error) {
      this.logger.error('Lỗi lấy danh sách Dashboards', error?.stack);
      throw new HttpException(
        error.response?.data?.message || 'Lỗi kết nối Superset khi lấy Dashboards',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Lấy danh sách toàn bộ Charts
   */
  async getCharts() {
    try {
      const token = await this.getAccessToken();
      const authHeader = { Authorization: `Bearer ${token}` };

      // Tương tự, cấu hình query cho Chart
      const queryParams = JSON.stringify({
        page_size: 100,
        columns: ['id', 'slice_name', 'viz_type', 'datasource_name_text', 'url', 'description']
      });

      const response = await this.client.get('/chart/', {
        headers: authHeader,
        params: { q: queryParams },
      });

      return response.data.result.map((chart: any) => ({
        id: chart.id,
        name: chart.slice_name,              // Tên biểu đồ
        type: chart.viz_type,                // Loại biểu đồ (pie, bar, table...)
        dataset: chart.datasource_name_text, // Tên dataset đang dùng
        description: chart.description || '',
        url: `${this.configService.get('SUPERSET_URL')}${chart.url}`,
      }));
    } catch (error) {
      this.logger.error('Lỗi lấy danh sách Charts', error?.stack);
      throw new HttpException(
        error.response?.data?.message || 'Lỗi kết nối Superset khi lấy Charts',
        HttpStatus.BAD_REQUEST,
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
      this.logger.error(`Lỗi lấy dữ liệu Chart ${chartId}`, error?.stack);
      throw new HttpException(
        error.response?.data?.message || 'Lỗi kết nối Superset',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getChartMetadata(chartId: number) {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get(`/chart/${chartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Trả về toàn bộ object 'result' chứa label_columns, params, viz_type...
      return response.data;
    } catch (error) {
      this.logger.error(`Lỗi lấy Metadata Chart ${chartId}:`, error.response?.data || error.message);
      throw new HttpException(
        `Không thể lấy thông tin cấu hình cho Chart ID ${chartId}`,
        HttpStatus.NOT_FOUND,
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