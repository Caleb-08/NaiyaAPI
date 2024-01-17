import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompareAdsDto } from './dto/compare-ads.dto'

@Injectable()
export class CompareAdsService {
  constructor(private prisma: PrismaService) {}

  async saveComparedAds(data: CompareAdsDto) {
    const comparedAdStore = [];
    data.comparedAds.forEach((res) => {
      if (!comparedAdStore.includes(res.store.id)) {
        comparedAdStore.push(res.store.id);
      }
    });

    return this.prisma.comparedAds.create({
      data: {
        compareUserId: data.compareUserId,
        comparedAds: data.comparedAds,
        comparedAdStore: comparedAdStore,
      },
    });
  }

  async getComparedAdsById(compareId: string): Promise<any> {
    return this.prisma.comparedAds.findUnique({
      where: {
        id: compareId,
      },
    });
  }

  async getAllUserComparedAds(userId: string): Promise<any> {
    return this.prisma.comparedAds.findMany({
      where: {
        compareUserId: userId,
      },
    });
  }

  getAllStoreComparedAds(storeId: string): Promise<any> {
    return this.prisma.comparedAds.findMany({
      where: {
        comparedAdStore: {
          has: storeId,
        },
      },
    });
  }
}
