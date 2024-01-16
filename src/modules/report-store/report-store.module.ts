import { Module } from '@nestjs/common';
import { ReportStoreController } from './report-store.controller';
import { ReportStoreService } from './report-store.service';

@Module({
  controllers: [ReportStoreController],
  providers: [ReportStoreService],
})
export class ReportStoreModule {}
