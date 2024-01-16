import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  generateSlug,
  httpErrorException,
} from '../../core/services/utility.service';
import { CreateAdDto, PublishAndUnPublishAd } from './dto';
import { FileUploadService } from '../../core/services/file-upload.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AdService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private fileUploadService: FileUploadService,
  ) {}

  async createAd(adData: CreateAdDto, userId: string): Promise<any> {
    const existingStore: any = await this.prisma.store.findFirst({
      where: {
        userId: userId,
        id: adData.storeId,
      },
    });

    if (!existingStore) {
      httpErrorException('You do not have permission to post ad to this store');
    }

    let adSlug = generateSlug(adData.title);

    while (true) {
      const existingAd: any = await this.prisma.ads.findFirst({
        where: {
          slug: adSlug,
        },
      });

      if (!existingAd) {
        break;
      }
      adSlug = generateSlug(`${adData.title}-${new Date().getTime()}`);
    }

    try {
      return await this.prisma.ads.create({
        data: {
          title: adData.title,
          slug: adSlug,
          description: adData.description,
          price: Number(adData.price),
          priceHistory: [
            {
              price: Number(adData.price),
              date: new Date(),
            },
          ],
          adData: adData.adData,
          subCategory: {
            connect: {
              id: adData.subCategoryId,
            },
          },
          store: {
            connect: {
              id: adData.storeId,
            },
          },
          city: {
            connect: {
              id: adData.cityId,
            },
          },
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async publishAndUnPublishAd(
    adData: PublishAndUnPublishAd,
    userId?: string | undefined,
    isAdmin?: boolean,
  ): Promise<any> {
    let existingStore: any;
    if (userId) {
      existingStore = await this.prisma.store.findFirst({
        where: {
          userId: userId,
          id: adData.storeId,
        },
      });
    }

    if (!existingStore && !isAdmin) {
      httpErrorException(
        'You do not have permission to publish/unpublish ad on this store',
      );
    }

    try {
      return await this.prisma.ads.update({
        where: {
          id: adData.adId,
        },
        data: {
          isPublished: adData.isPublished,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async updateAd(id: string, adData: any): Promise<any> {
    try {
      const adSlug = generateSlug(adData.title);

      const adDetailsOnDB = await this.getAdById(id);
      const priceHistory = adDetailsOnDB.priceHistory;

      if (adData.price !== adDetailsOnDB.priceHistory.at(-1).price) {
        priceHistory.push({
          price: adData.price,
          date: new Date(),
        });
      }

      return await this.prisma.ads.update({
        where: { id },
        data: {
          title: adData.title,
          slug: adSlug,
          description: adData.description,
          price: Number(adData.price),
          priceHistory: priceHistory,
          adData: adData.adData,
          isPublished: adData.isPublished,
          subCategoryId: adData.subCategoryId,
          storeId: adData.storeId,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async uploadAdImage(files: any, adId: string): Promise<any> {
    if (!files?.images) {
      httpErrorException("You've not selected any image");
    }

    const existingImages = await this.prisma.ads
      .findUnique({
        where: { id: adId },
        select: {
          images: true,
        },
      })
      .then((ad) => ad?.images || []);

    const maxImageSlots = 20;
    const remainingSlots = maxImageSlots - existingImages.length;

    if (remainingSlots <= 0) {
      httpErrorException(
        'The maximum number of images (20) for this ad has been reached.',
      );
    }

    const adImages: { title: string; url: string; description: string }[] = [];

    await Promise.all(
      files.images.map(async (image: any) => {
        if (
          adImages.length < remainingSlots &&
          image.mimetype.startsWith('image/') &&
          image.size <= 5 * 1024 * 1024
        ) {
          const res = await this.fileUploadService.uploadImage(
            image,
            'ads/images',
          );
          adImages.push({
            url: res,
            title: null,
            description: null,
          });
        }
      }),
    );

    if (adImages.length === 0) {
      httpErrorException(
        'There was an error uploading your images, please try again. This may be as a result of your file size. maximum file size should be 5mb',
      );
    }

    return this.prisma.ads.update({
      where: { id: adId },
      data: {
        images: {
          push: adImages,
        },
      },
    });
  }

  async updateImageDetails(adId: string, imagesPayload: any[]) {
    try {
      const existingAd = await this.prisma.ads.findUnique({
        where: {
          id: adId,
        },
        select: {
          images: true,
        },
      });

      if (!existingAd) {
        httpErrorException(
          `We couldn't find the Ad whose image detail you want to edit`,
        );
      }

      existingAd.images = existingAd.images.map((image) => {
        const matchingPayloadImage = imagesPayload.find(
          (payloadImage) => payloadImage.url === image.url,
        );

        if (matchingPayloadImage) {
          image.title = matchingPayloadImage.title || null;
          image.description = matchingPayloadImage.description || null;
          image.position = matchingPayloadImage.position || null;
        }

        return image;
      });

      return await this.prisma.ads.update({
        where: {
          id: adId,
        },
        data: {
          images: {
            set: existingAd.images,
          },
        },
      });
    } catch (error) {
      httpErrorException(`Error updating image details: ${error.message}`);
    } finally {
      await this.prisma.$disconnect();
    }
  }
  async uploadAdVideo(files: any, adId: string): Promise<any> {
    if (!files?.video) {
      httpErrorException("You've not selected any video");
    }
    const video = files.video[0];
    if (
      video.mimetype.startsWith('video/') &&
      video.size <= 100 * 1024 * 1024
    ) {
      const adVideo = await this.prisma.ads.findFirst({
        where: { id: adId },
        select: {
          video: true,
        },
      });

      const video = await this.fileUploadService.uploadVideo(
        files.video[0],
        'ads/videos',
        adVideo?.video,
      );

      return this.prisma.ads.update({
        where: { id: adId },
        data: {
          video: video,
        },
      });
    } else {
      httpErrorException(
        'There was an error uploading your images, please try again',
      );
    }
  }

  async deleteAd(id: string): Promise<any> {
    try {
      const ad: any = await this.prisma.ads.findUnique({
        where: { id },
      });

      // Use map to create an array of image upload promises
      const uploadPromises = ad.images.map(async (imageURL: any) => {
        await this.fileUploadService.deleteFileFromDigitalOcean(
          imageURL.url.split('/').at(-1),
          'ads/images',
        );
      });

      // Wait for all image upload promises to complete
      await Promise.all(uploadPromises);

      return await this.prisma.ads.delete({
        where: { id },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getAllAds(): Promise<any[]> {
    try {
      return await this.prisma.ads.findMany({
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          city: {
            select: {
              name: true,
              slug: true,
              state: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getAdById(id: string): Promise<any> {
    try {
      return await this.prisma.ads.findFirst({
        where: { id },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              phoneNumber: true,
              logo: true,
              description: true,
              state: true,
              city: true,
              storeAddress: true,
              messenger: true,
              whatsApp: true,
              telegram: true,
              deliverTo: true,
            },
          },
          subCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          city: {
            select: {
              name: true,
              slug: true,
              state: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }
  async getAdBySlug(slug: string, analytics?: any): Promise<any> {
    try {
      const adDetails: any = await this.prisma.ads.findFirstOrThrow({
        where: { slug },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              phoneNumber: true,
              logo: true,
              description: true,
              state: true,
              city: true,
              storeAddress: true,
              messenger: true,
              whatsApp: true,
              telegram: true,
              deliverTo: true,
            },
          },
          subCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          city: {
            select: {
              name: true,
              slug: true,
              state: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (analytics) {
        this.eventEmitter.emit('analytics.createAnalyticsEvent', {
          type: 'adView',
          adId: adDetails.id,
          storeId: adDetails.store.id,
        });

        this.eventEmitter.emit('ad.updateAdViewEvent', {
          adId: adDetails.id,
          views: Number(adDetails.views),
          updatedAt: adDetails.updatedAt,
        });
      }
      return adDetails;
    } catch (error) {
      httpErrorException(error);
    }
  }

  async searchAdsOld(query: string): Promise<any[]> {
    try {
      const searchTerms = query.trim().split(/\s+/);

      const conditions: any = searchTerms.map((term: any) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      }));

      return this.prisma.ads.findMany({
        where: {
          OR: conditions,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }
  async getAdsBySubcategoryId(subCategoryId: string): Promise<any[]> {
    try {
      return await this.prisma.ads.findMany({
        where: {
          subCategoryId,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }
}
