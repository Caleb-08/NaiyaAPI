import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecentlyViewedAdDto } from './dto/create-recently-viewed-ads.dto';

@Injectable()
export class RecentlyViewedAdsService {
  constructor(private readonly prisma: PrismaService) {}

  async addRecentlyViewedAd(data: CreateRecentlyViewedAdDto) {
    return this.prisma.recentlyViewedAd.create({
      data: {
        userId: data.userId,
        adId: data.adId,
      },
    });
  }

  async getRecentlyViewedAdsForUser(userId: string) {
    return this.prisma.recentlyViewedAd.findMany({
      where: {
        userId,
      },
      include: {
        ad: true,
      },
      orderBy: {
        viewedAt: 'desc',
      },
      take: 10,
    });
  }
}
