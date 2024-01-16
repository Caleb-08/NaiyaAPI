import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportStoreDto } from './dto/report-store.dto';

@Injectable()
export class ReportStoreService {
  constructor(private readonly prisma: PrismaService) {}

  async reportStore(storeId: string, reportStoreDto: ReportStoreDto) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found.`);
    }

    const reportedStore = await this.prisma.reportStore.create({
      data: {
        store: { connect: { id: storeId } },
        reportedBy: {
          connect: { id: reportStoreDto.reportedById }, // Use reportedById from DTO
        },
        reason: reportStoreDto.reason,
      },
    });

    return reportedStore;
  }

  async getAllReportedStores() {
    const reportedStores = await this.prisma.reporteStore.findMany({
      include: { store: true },
    });

    return reportedStores;
  }
}
