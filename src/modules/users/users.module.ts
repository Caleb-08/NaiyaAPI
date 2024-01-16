import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StoreService } from '../store/store.service';

@Module({
  providers: [UsersService, StoreService],
  controllers: [UsersController],
})
export class UsersModule {}
