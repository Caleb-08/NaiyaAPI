import { Module } from '@nestjs/common';
import { CompareAdsService } from './compare-ads.service';
import { CompareAdsController } from './compare-ads.controller';

@Module({
  providers: [CompareAdsService],
  controllers: [CompareAdsController],
})
export class CompareAdsModule {}
