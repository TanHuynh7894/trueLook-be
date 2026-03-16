import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRolesModule } from '../user_roles/user_roles.module';
import { KeycloakService } from './keycloak.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserRolesModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    KeycloakService
  ],
  exports: [UsersService],
})
export class UsersModule {}
