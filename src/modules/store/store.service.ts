import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { httpErrorException } from '../../core/services/utility.service';
import {
  generateStoreBannerDataURLFromText,
  generateStoreLogoDataURLFromText,
} from '../../core/services/generate-image-dataurl-from-text';
import { CreateStore } from './dto';
import { AdService } from '../Ad/ad.service';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService, private adService: AdService) {}

  async getAllStoreAds(slug: string): Promise<any[]> {
    try {
      return await this.prisma.ads.findMany({
        where: {
          store: {
            slug: slug,
          },
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async createStore(storeData: CreateStore, userId: any): Promise<any> {
    try {
      const checkSlug: any = await this.checkIfStoreSlugExist(storeData.slug);
      if (checkSlug) {
        httpErrorException('A store with this slug already exist');
      }

      return await this.prisma.store.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          category: {
            connect: {
              id: storeData.categoryId,
            },
          },
          name: storeData.name,
          slug: storeData.slug,
          phoneNumber: storeData.phoneNumber,
          description: storeData.description,
          email: storeData.email,
          state: storeData.state,
          city: storeData.city,
          storeAddress: storeData.storeAddress,
          facebook: storeData.facebook,
          messenger: storeData.messenger,
          instagram: storeData.instagram,
          whatsApp: storeData.whatsApp,
          telegram: storeData.telegram,
          externalURL: storeData.externalURL,
          openingHour: storeData.openingHour,
          closingHour: storeData.closingHour,
          workingDays: storeData.workingDays,
          deliverTo: storeData.deliverTo,
          isDisabled: false,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getAllStores(): Promise<any[]> {
    try {
      return await this.prisma.store.findMany();
    } catch (error) {
      httpErrorException(error);
    }
  }

  async checkIfStoreSlugExist(slug: string) {
    return this.prisma.store.findFirst({
      where: {
        slug: slug,
      },
    });
  }

  async getStoreByIdOrSlug(slug: string): Promise<any> {
    const isValidObjectId = (str: string) => {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      return objectIdPattern.test(str);
    };

    if (isValidObjectId(slug)) {
      return this.prisma.store
        .findUniqueOrThrow({
          where: {
            id: slug,
          },
        })
        .then((store: any) => {
          store.logo = generateStoreLogoDataURLFromText(store.name);
          store.banner = generateStoreBannerDataURLFromText(store.name);
          return store;
        });
    } else {
      return this.prisma.store
        .findUniqueOrThrow({
          where: {
            slug: slug,
          },
        })
        .then((store: any) => {
          store.logo = generateStoreLogoDataURLFromText(store.name);
          store.banner = generateStoreBannerDataURLFromText(store.name);
          return store;
        });
    }
  }

  async getAllUserStoresByUserId(id: string): Promise<any> {
    return this.prisma.store
      .findMany({
        where: { userId: id },
      })
      .then((store: any) =>
        store.map((store: any) => ({
          ...store,
          logo: generateStoreLogoDataURLFromText(store.name),
          banner: generateStoreBannerDataURLFromText(store.name),
        })),
      );
  }

  async updateStore(storeData: any, storeId: string): Promise<any> {
    try {
      if (storeData.slug) {
        const checkSlug: any = await this.checkIfStoreSlugExist(storeData.slug);
        if (checkSlug && checkSlug.id !== storeId) {
          httpErrorException('A store with this slug already exist');
        }
      }

      return await this.prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          category: {
            connect: {
              id: storeData.categoryId,
            },
          },
          name: storeData.name,
          slug: storeData.slug,
          phoneNumber: storeData.phoneNumber,
          description: storeData.description,
          state: storeData.state,
          city: storeData.city,
          storeAddress: storeData.storeAddress,
          facebook: storeData.facebook,
          messenger: storeData.messenger,
          instagram: storeData.instagram,
          whatsApp: storeData.whatsApp,
          telegram: storeData.telegram,
          externalURL: storeData.externalURL,
          openingHour: storeData.openingHour,
          closingHour: storeData.closingHour,
          workingDays: storeData.workingDays,
          deliverTo: storeData.deliverTo,
          isDisabled: storeData.isDisabled,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async disableStore(req: any, storeId: string): Promise<any> {
    const store: any = await this.prisma.store.findFirst({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      httpErrorException('Store not found');
    }

    if (req.user?.id !== store.userId && !req.user.isAdmin) {
      httpErrorException('You are not authorized to disable this store');
    }

    const allStoreAds = await this.getAllStoreAds(store.slug);

    await Promise.all(
      allStoreAds.map((ad) =>
        this.adService.publishAndUnPublishAd(
          {
            adId: ad.id,
            storeId: storeId,
            isPublished: false,
          },
          undefined,
          true,
        ),
      ),
    );

    await this.prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isDisabled: true,
      },
    });

    return {
      message: `Store disabled successfully, and all its ads are unpublished`,
    };
  }

  async enableStore(req: any, storeId: string): Promise<any> {
    const store: any = await this.prisma.store.findFirst({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      httpErrorException('Store not found');
    }

    if (req.user?.id !== store.userId && !req.user.isAdmin) {
      httpErrorException('You are not authorized to enable this store');
    }

    await this.prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isDisabled: false,
      },
    });

    return {
      message: `Store enabled successfully`,
    };
  }

  async deleteAllStoreAds(id: string): Promise<any> {
    try {
      const allStoreAds: any[] = await this.prisma.ads.findMany({
        where: {
          store: {
            id: id,
          },
        },
      });

      return await Promise.all(
        allStoreAds.map((ad) => this.adService.deleteAd(ad.id)),
      );
    } catch (error) {
      // Handle errors related to ad deletion
      httpErrorException(error);
    }
  }

  async deleteStoreAndAllItAds(id: string): Promise<any> {
    try {
      await this.deleteAllStoreAds(id);

      return await this.prisma.store.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      // Handle errors related to store deletion
      httpErrorException(error);
    }
  }

  async getStoreByAdId(adId: string): Promise<any> {
    try {
      return await this.prisma.store.findFirst({
        where: {
          ads: {
            some: {
              id: adId,
            },
          },
        },
        include: {
          category: true,
          user: true,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }
}
