import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import { SupersetService } from '../superset/superset.service';

@Injectable()
export class AiSupersetService {
  private readonly logger = new Logger(AiSupersetService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private readonly supersetService: SupersetService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('CẢNH BÁO: Chưa tìm thấy GEMINI_API_KEY trong biến môi trường!');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.logger.log('Đã khởi tạo AiSupersetService thành công.');
  }

  private readonly generationConfig: GenerationConfig = {
    temperature: 0.4,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192, 
  };

  async getPreviewData(chartIds: number[]) {
    this.logger.log(`[Preview] Bắt đầu lấy dữ liệu cho các chartIds: [${chartIds.join(', ')}]`);

    if (!chartIds || !Array.isArray(chartIds) || chartIds.length === 0) {
      this.logger.error('[Preview] Lỗi đầu vào: chartIds không hợp lệ.');
      throw new BadRequestException('Vui lòng cung cấp một mảng chartIds (ví dụ: [1, 2]).');
    }

    try {
      this.logger.debug(`[Preview] Đang gọi SupersetService để fetch ${chartIds.length} biểu đồ...`);
      const promises = chartIds.map(id => this.supersetService.getChartData(id));
      const chartsData = await Promise.all(promises);
      
      this.logger.log(`[Preview] Thành công! Đã lấy và gộp xong dữ liệu của ${chartsData.length} biểu đồ.`);
      
      return {
        success: true,
        total_charts: chartsData.length,
        preview_data: chartsData,
      };
    } catch (error) {
      this.logger.error(`[Preview] Lỗi khi lấy dữ liệu gộp từ Superset: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Không thể lấy dữ liệu gộp từ Superset.');
    }
  }

  async analyzeCharts(selectedModel: string, chartIds: number[]) {
    this.logger.log(`[Analyze] Bắt đầu phân tích. Model: ${selectedModel} | ChartIds: [${chartIds.join(', ')}]`);

    if (!selectedModel || !chartIds || chartIds.length === 0) {
      this.logger.error('[Analyze] Lỗi đầu vào: Thiếu Model hoặc chartIds.');
      throw new BadRequestException('Vui lòng cung cấp Model và mảng chartIds.');
    }

    try {
      // 1. Lấy dữ liệu gộp
      this.logger.debug('[Analyze] Bước 1: Gọi hàm getPreviewData để gom dữ liệu...');
      const { preview_data } = await this.getPreviewData(chartIds);

      // 2. Kịch bản thông minh
      this.logger.debug(`[Analyze] Bước 2: Thiết lập kịch bản phân tích cho ${preview_data.length} biểu đồ...`);
      const isMultiple = preview_data.length > 1;
      const taskDescription = isMultiple 
        ? '- SO SÁNH CHÉO: Tìm ra mối tương quan, sự khác biệt và nguyên nhân sâu xa khi đối chiếu các biểu đồ này với nhau.\n- ĐỀ XUẤT: Đưa ra quyết định chiến lược tổng thể dựa trên việc kết hợp các số liệu.'
        : '- PHÂN TÍCH: Đánh giá chi tiết số liệu của biểu đồ này.\n- ĐỀ XUẤT: Đưa ra quyết định và hành động cụ thể để tối ưu chỉ số này.';

      const systemInstruction = `
        Bạn là chuyên gia Hệ thống Hỗ trợ Ra quyết định (DSS) của True Look.
        NHIỆM VỤ: Đọc dữ liệu JSON của ${preview_data.length} biểu đồ và đưa ra báo cáo.
        
        ĐỊNH DẠNG BẮT BUỘC:
        - Viết bằng tiếng Việt, trong khoảng 10 - 20 dòng điểm tin (dùng gạch đầu dòng -).
        ${taskDescription}
        - Đi thẳng vào vấn đề: Nêu con số nổi bật, Cảnh báo rủi ro và Đề xuất quyết định.
      `;

      // 3. Khởi tạo Model và gọi Google Gemini
      this.logger.debug(`[Analyze] Bước 3: Khởi tạo model Gemini (${selectedModel})...`);
      const model = this.genAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction: systemInstruction,
      });

      const prompt = `Dữ liệu phân tích: ${JSON.stringify(preview_data)}`;
      
      this.logger.log('[Analyze] Đang gửi dữ liệu lên Google Gemini. Vui lòng đợi...');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
      });

      const response = await result.response;
      
      // LOG CỰC KỲ QUAN TRỌNG: Kiểm tra lý do AI dừng viết
      const finishReason = response.candidates?.[0]?.finishReason;
      this.logger.log(`[Analyze] Đã nhận phản hồi từ Gemini. Lý do kết thúc (finishReason): ${finishReason}`);
      
      if (finishReason === 'MAX_TOKENS') {
        this.logger.warn('[Analyze] CẢNH BÁO: Phản hồi bị cắt ngang vì đạt giới hạn Max Tokens!');
      } else if (finishReason === 'SAFETY') {
        this.logger.warn('[Analyze] CẢNH BÁO: Phản hồi bị chặn do vi phạm chính sách an toàn của Google!');
      }

      this.logger.log('[Analyze] Quá trình phân tích hoàn tất thành công!');
      
      return {
        success: true,
        modelUsed: selectedModel,
        chartsAnalyzed: chartIds,
        finishReason: finishReason, // Trả luôn ra ngoài cho Frontend/Postman thấy
        analysis: response.text(),
      };
    } catch (error) {
      this.logger.error(`[Analyze] Lỗi trong quá trình phân tích: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Lỗi từ Google AI: ${error.message}`);
    }
  }

  async listModels() {
    this.logger.debug('[ListModels] Đang lấy danh sách các model khả dụng...');
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();
      this.logger.log(`[ListModels] Lấy thành công ${data.models?.length || 0} models.`);
      return { success: true, available_models: data.models?.map(m => m.name.replace('models/', '')) };
    } catch (error) {
      this.logger.error(`[ListModels] Lỗi khi lấy danh sách model: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách Model từ Google.');
    }
  }
}