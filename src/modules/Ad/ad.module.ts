import { Global, Module } from "@nestjs/common";
import { AdService } from './ad.service';
import { AdController } from './ad.controller';
import { FileUploadService } from '../../core/services/file-upload.service';
import { AdCornService } from './ad-corn.service';
import { AdEventsService } from './ad-events.service';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 1000 * 60 * 60,
    }),
  ],
  providers: [AdService, FileUploadService, AdCornService, AdEventsService],
  controllers: [AdController],
  exports: [AdService],
})
export class AdModule {}
