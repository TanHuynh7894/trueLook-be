import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

@Injectable()
export class AiSupersetService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  // Cấu hình tối ưu cho báo cáo ngắn gọn (10-20 dòng)
  private readonly generationConfig: GenerationConfig = {
    temperature: 0.4,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1000, 
  };

  /**
   * HÀM DSS: Nhận vào Model cụ thể và dữ liệu JSON
   */
  async analyzeWithModel(selectedModel: string, jsonData: any) {
    if (!selectedModel) throw new BadRequestException('Vui lòng chọn model (ví dụ: gemini-2.5-pro)');
    if (!jsonData) throw new BadRequestException('Dữ liệu JSON không được để trống.');

    try {
      // Khởi tạo model dựa trên lựa chọn của người dùng
      const model = this.genAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction: `
          Bạn là chuyên gia DSS của hệ thống True Look.
          NHIỆM VỤ: Phân tích JSON và đưa ra báo cáo hỗ trợ ra quyết định.
          
          ĐỊNH DẠNG TRẢ LỜI (BẮT BUỘC):
          - Viết bằng tiếng Việt.
          - Chỉ trả lời trong khoảng 10 - 20 dòng điểm tin (bullet points).
          - Mỗi dòng nêu 1 ý chính: So sánh số liệu, Cảnh báo bất thường, hoặc Đề xuất quyết định.
          - Đi thẳng vào vấn đề, không chào hỏi, không kết luận rườm rà.
        `,
      });

      const prompt = `Dữ liệu phân tích: ${JSON.stringify(jsonData)}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
      });

      const response = await result.response;
      
      return {
        success: true,
        modelUsed: selectedModel,
        analysis: response.text(),
      };
    } catch (error) {
      console.error('Lỗi Gemini DSS:', error);
      // Trả về lỗi chi tiết để bạn biết nếu chọn sai tên model
      throw new InternalServerErrorException(`Lỗi từ Google AI: ${error.message}`);
    }
  }

  // Giữ lại hàm liệt kê model để Frontend lấy danh sách đưa vào dropdown
  async listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    return { success: true, available_models: data.models?.map(m => m.name.replace('models/', '')) };
  }
}