import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { CacheModule } from '@nestjs/cache-manager';
import { SearchEventsService } from './search-events.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    CacheModule.register({
      ttl: 1000 * 60 * 60,
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchEventsService, JwtService],
})
export class SearchModule {}
