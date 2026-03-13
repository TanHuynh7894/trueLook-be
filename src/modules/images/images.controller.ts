import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import type { Request } from 'express';

import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiExcludeController, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Delete, NotFoundException, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
  @Roles('System Admin', 'Manager', 'Sales Staff', 'Operation Staff')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {

          console.log("USER:", req.user);

          const roles = (req.user as any)?.roles || [];

          console.log("ROLES:", roles);

          let uploadPath = 'src/uploads';

          if (roles.includes('Operation Staff') || roles.includes('Customer')) {
            uploadPath = 'uploads/images';
          }

          console.log("UPLOAD PATH:", uploadPath);

          cb(null, uploadPath);
        }
        ,
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  async getImage(
    @Param('id') id: string,
    @Res() res: Response,
  ) {

    const filepath = await this.imagesService.getImagePathById(id);

    if (!filepath) {
      return res.status(404).json({
        message: 'Image not found'
      });
    }

    return res.sendFile(filepath);
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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  getAllImages() {
    return this.imagesService.getAllImages();
  }
}