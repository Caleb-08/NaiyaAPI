import { Injectable } from '@nestjs/common';
import { AdService } from './ad.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileUploadService } from '../../core/services/file-upload.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdCornService {
  constructor(
    private readonly adService: AdService,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private fileUploadService: FileUploadService,
    private config: ConfigService,
  ) {}

  getDateOfSomeDaysAgo(noOfDays: number): Date {
    const currentDate = new Date();
    const ninetyDaysAgo = new Date(currentDate);
    ninetyDaysAgo.setDate(currentDate.getDate() - noOfDays);
    return ninetyDaysAgo;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteStaledAds() {
    try {
      const adsToBeDeleted: any = await this.prisma.ads.findMany({
        where: {
          isPublished: false,
          updatedAt: {
            lt: this.getDateOfSomeDaysAgo(
              this.config.get('DAYS_TO_DELETE_UN-UPDATED_ADS'),
            ),
          },
        },
        select: {
          id: true,
          title: true,
          store: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      for (const ad of adsToBeDeleted) {
        await this.adService.deleteAd(ad.id);
        this.eventEmitter.emit('ad.staledAdDeletedEmailMessage', {
          adName: ad.title,
          storeName: ad.store.name,
          storeEmail: ad.store.email,
        });
      }
    } catch (error) {
      console.error('Error executing deleteAd service:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async noticeToUpdateAd() {
    try {
      const adsToBeDeleted: any = await this.prisma.ads.findMany({
        where: {
          isPublished: true,
          updatedAt: {
            lt: this.getDateOfSomeDaysAgo(
              this.config.get('DaysTOSendUpdateAdEmail'),
            ),
          },
        },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          store: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      for (const ad of adsToBeDeleted) {
        this.eventEmitter.emit('ad.noticeToUpdateAd', {
          adName: ad.title,
          storeName: ad.store.name,
          storeEmail: ad.store.email,
        });
      }
    } catch (error) {
      console.error('Error executing deleteAd service:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async unPublishOldAds() {
    try {
      const adsToBeDeleted: any = await this.prisma.ads.findMany({
        where: {
          isPublished: true,
          updatedAt: {
            lt: this.getDateOfSomeDaysAgo(
              this.config.get('DaysToUnpublishedAnAd'),
            ),
          },
        },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          store: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      for (const ad of adsToBeDeleted) {
        await this.prisma.ads.update({
          where: {
            id: ad.id,
          },
          data: {
            isPublished: false,
            updatedAt: ad.updatedAt,
          },
        });
        this.eventEmitter.emit('ad.unPublishOldAdsEmailMessage', {
          adName: ad.title,
          storeName: ad.store.name,
          storeEmail: ad.store.email,
        });
      }
    } catch (error) {
      console.error('Error executing deleteAd service:', error);
    }
  }

  // @Cron(CronExpression.EVERY_DAY_AT_8AM)
  // async deleteStaledAds() {
  //   try {
  //     const adsToBeDeleted: any = await this.prisma.ads.findMany({
  //       where: {
  //         isPublished: false,
  //         updatedAt: {
  //           lt: this.getDateOfSomeDaysAgo(
  //             this.config.get('DAYS_TO_DELETE_UN-UPDATED_ADS'),
  //           ),
  //         },
  //       },
  //       select: {
  //         id: true,
  //         title: true,
  //         store: {
  //           select: {
  //             email: true,
  //             name: true,
  //           },
  //         },
  //       },
  //     });
  //
  //     for (const ad of adsToBeDeleted) {
  //       await this.adService.deleteAd(ad.id);
  //       this.eventEmitter.emit('ad.staledAdDeletedEmailMessage', {
  //         adName: ad.title,
  //         storeName: ad.store.name,
  //         storeEmail: ad.store.email,
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error executing deleteAd service:', error);
  //   }
  // }
}
