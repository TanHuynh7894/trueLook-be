import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { AiSupersetService } from './ai-superset.service';

@Controller('ai-superset')
export class AiSupersetController {
  constructor(private readonly aiSupersetService: AiSupersetService) { }

  @Get('models')
  getAvailableModels() {
    return this.aiSupersetService.listModels();
  }

  @Post('analyze')
  async analyzeData(
    @Body('model') selectedModel: string,
    @Body('data') jsonData: any
  ) {
    return this.aiSupersetService.analyzeWithModel(selectedModel, jsonData);
  }
}