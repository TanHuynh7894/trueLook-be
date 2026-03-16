import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';

import path, { join } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Delete, Get, Param, Res } from '@nestjs/common';
import { imageUploadConfig } from './config/image-upload.config';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  @Post('upload')
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        variant_id: {
          type: 'string',
          example: '1772179859988',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Sales Staff', 'Operation Staff', 'Customer')
  @UseInterceptors(FileInterceptor('file', imageUploadConfig()))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateImageDto,
    @Req() req: Request,
  ) {
    const roles = (req.user as any)?.roles || [];

    return this.imagesService.uploadImage(file, dto, roles);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an image by id' })
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const image = await this.imagesService.findOne(id);

    const filePath = path.resolve(image.path);

    return res.sendFile(filePath);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an image' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  async deleteImage(@Param('id') id: string) {
    return this.imagesService.deleteImage(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images' })
  getAllImages() {
    return this.imagesService.getAllImages();
  }
}