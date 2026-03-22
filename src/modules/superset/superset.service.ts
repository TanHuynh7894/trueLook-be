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
      throw new HttpException('Lỗi xác thực với Keycloak hệ thống', HttpStatus.UNAUTHORIZED);
    }
  }

  async getDashboards() {
    try {
      const token = await this.getAccessToken();
      const authHeader = { Authorization: `Bearer ${token}` };

      const queryParams = JSON.stringify({
        page_size: 100, 
        columns: ['id', 'dashboard_title', 'published', 'url', 'changed_by.first_name', 'changed_by.last_name']
      });

      const response = await this.client.get('/dashboard/', { headers: authHeader, params: { q: queryParams } });

      return response.data.result.map((dash: any) => ({
        id: dash.id,
        title: dash.dashboard_title,
        isPublished: dash.published,
        url: `${this.configService.get('SUPERSET_URL')}${dash.url}`,
        author: dash.changed_by ? `${dash.changed_by.first_name} ${dash.changed_by.last_name}`.trim() : 'Unknown',
      }));
    } catch (error) {
      this.logger.error('Lỗi lấy danh sách Dashboards', error?.stack);
      throw new HttpException(error.response?.data?.message || 'Lỗi kết nối Superset', HttpStatus.BAD_REQUEST);
    }
  }

  async getCharts() {
    try {
      const token = await this.getAccessToken();
      const authHeader = { Authorization: `Bearer ${token}` };

      const queryParams = JSON.stringify({
        page_size: 100,
        columns: ['id', 'slice_name', 'viz_type', 'datasource_name_text', 'url', 'description']
      });

      const response = await this.client.get('/chart/', { headers: authHeader, params: { q: queryParams } });

      return response.data.result.map((chart: any) => ({
        id: chart.id,
        name: chart.slice_name,
        type: chart.viz_type,
        dataset: chart.datasource_name_text,
        description: chart.description || '',
        url: `${this.configService.get('SUPERSET_URL')}${chart.url}`,
      }));
    } catch (error) {
      this.logger.error('Lỗi lấy danh sách Charts', error?.stack);
      throw new HttpException(error.response?.data?.message || 'Lỗi kết nối Superset', HttpStatus.BAD_REQUEST);
    }
  }

  async getChartData(chartId: number) {
    try {
      const token = await this.getAccessToken();
      const authHeader = { Authorization: `Bearer ${token}` };

      const metadata = await this.client.get(`/chart/${chartId}`, { headers: authHeader });
      const resultMeta = metadata.data.result;
      const queryContext = JSON.parse(resultMeta.query_context);

      const dataResponse = await this.client.post('/chart/data', queryContext, { headers: authHeader });

      let dashboardTitle = 'Biểu đồ độc lập';
      if (resultMeta.dashboards && resultMeta.dashboards.length > 0) {
        dashboardTitle = resultMeta.dashboards[0].dashboard_title;
      }

      return {
        chart_id: chartId,
        chart_name: resultMeta.slice_name || 'Không rõ tên biểu đồ',
        chart_type: resultMeta.viz_type || 'Không rõ loại',
        dashboard_title: dashboardTitle,
        metrics: dataResponse.data.result[0].colnames || [],
        data: dataResponse.data.result[0].data || [],
      };
    } catch (error) {
      this.logger.error(`Lỗi lấy và gộp dữ liệu Chart ${chartId}`, error?.stack);
      throw new HttpException(error.response?.data?.message || 'Lỗi kết nối Superset khi lấy data', HttpStatus.BAD_REQUEST);
    }
  }

  async getChartMetadata(chartId: number) {
    try {
      const token = await this.getAccessToken();
      const response = await this.client.get(`/chart/${chartId}`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      throw new HttpException(`Không thể lấy Metadata cho Chart ${chartId}`, HttpStatus.NOT_FOUND);
    }
  }

  getSsoLink() {
    return { url: `${this.configService.get('SUPERSET_URL')}/login/keycloak` };
  }
}