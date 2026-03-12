import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupersetService {
  constructor(private configService: ConfigService) {}

  getSsoLink() {
    const baseUrl = this.configService.get<string>('SUPERSET_URL'); // https://superset.tanhuynh.xyz
    return {
      url: `${baseUrl}/login/keycloak`
    };
  }
}