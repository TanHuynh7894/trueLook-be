import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    var slogan = 'Welcome to True-Look\nLive true, look Sharp.';
    return slogan;
  }
}
