import { Module } from '@nestjs/common';
import { FollowStoreController } from './follow-store.controller';
import { FollowStoreService } from './follow-store.service';

@Module({
  controllers: [FollowStoreController],
  providers: [FollowStoreService],
})
export class FollowStoreModule {}
