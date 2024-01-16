import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  @OnEvent('analytics.createAnalyticsEvent', { async: true })
  async createAnalyticsEvent(payload: any): Promise<any> {
    await this.prisma.analytics.create({
      data: {
        type: payload.type,
        otherData: payload.otherData,
        ad: payload.adId
          ? {
              connect: {
                id: payload.adId,
              },
            }
          : undefined,
        store: payload.storeId
          ? {
              connect: {
                id: payload.storeId,
              },
            }
          : undefined,
      },
    });
  }
  @OnEvent('ad.updateAdViewEvent', { async: true })
  async updateAdViewEvent(payload: any): Promise<any> {
    await this.prisma.ads.update({
      where: { id: payload.adId },
      data: {
        views: payload.views + 1,
        updatedAt: payload.updatedAt,
      },
    });
  }
}
