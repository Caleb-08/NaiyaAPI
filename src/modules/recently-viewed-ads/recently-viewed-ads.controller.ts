import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RecentlyViewedAdsService } from './recently-viewed-ads.service';
import { CreateRecentlyViewedAdDto } from './dto/create-recently-viewed-ads.dto';

@Controller('recentlyViewed')
export class RecentlyViewedAdsController {
  constructor(private recentlyViewedAdsService: RecentlyViewedAdsService) {}

  @Post()
  async addRecentlyViewedAd(
    @Body() createRecentlyViewedAdDto: CreateRecentlyViewedAdDto,
  ) {
    return this.recentlyViewedAdsService.addRecentlyViewedAd(
      createRecentlyViewedAdDto,
    );
  }

  @Get(':userId')
  async getRecentlyViewedAdsForUser(@Param('userId') userId: string) {
    return this.recentlyViewedAdsService.getRecentlyViewedAdsForUser(userId);
  }
}
