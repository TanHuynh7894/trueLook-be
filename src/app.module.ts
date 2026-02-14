import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RolesModule } from './modules/roles/roles.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ShippingProvidersModule } from './modules/shipping_providers/shipping_providers.module';
import { ShippingServicesModule } from './modules/shipping_services/shipping_services.module';
import { UserRolesModule } from './modules/user_roles/user_roles.module';
import { LogsModule } from './modules/logs/logs.module';
import { AddressesModule } from './modules/addresses/addresses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RolesModule,
    BrandsModule,
    CategoriesModule,
    PromotionsModule,
    ShippingProvidersModule,
    ShippingServicesModule,
    UserRolesModule,
    LogsModule,
    AddressesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
