import { Module } from '@nestjs/common';
import { RecentlyViewedAdsService } from './recently-viewed-ads.service';
import { RecentlyViewedAdsController } from './recently-viewed-ads.controller';

@Module({
  providers: [RecentlyViewedAdsService],
  controllers: [RecentlyViewedAdsController],
})
export class RecentlyViewedAdsModule {}
