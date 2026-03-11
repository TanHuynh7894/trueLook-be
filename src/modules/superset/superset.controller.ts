import { Controller, Get, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { SupersetService } from './superset.service';
import { LoginSupersetDto } from './dto/login-superset.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Superset')
@ApiBearerAuth('access-token')
@Controller('superset')
export class SupersetController {
  constructor(private readonly supersetService: SupersetService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @Get('sso-link')
  getLink() {
    return this.supersetService.getSsoLink();
  }
}