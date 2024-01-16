import { ReportStoreService } from './modules/report-store/report-store.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './modules/categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { RegionsModule } from './modules/regions/regions.module';
import { RegionsController } from './modules/regions/regions.controller';
import { RegionsService } from './modules/regions/regions.service';
import { StoreModule } from './modules/store/store.module';
import { StoreController } from './modules/store/store.controller';
import { StoreService } from './modules/store/store.service';
import { ResponseTemplateInterceptor } from './core/interceptors/response-template/response-template.interceptor';
import { UsersController } from './modules/users/users.controller';
import { UsersService } from './modules/users/users.service';
import { UsersModule } from './modules/users/users.module';
import { ModelsModule } from './modules/models/models.module';
import { ModelsController } from './modules/models/models.controller';
import { ModelsService } from './modules/models/models.service';
import { StoriesModule } from './modules/stories/stories.module';
import { StoriesController } from './modules/stories/stories.controller';
import { StoriesService } from './modules/stories/stories.service';
import { AdModule } from './modules/Ad/ad.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReviewsController } from './modules/reviews/reviews.controller';
import { ReviewsService } from './modules/reviews/reviews.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './core/services/events.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { CompareAdsModule } from './modules/compareAds/compare-ads.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SearchModule } from './modules/search/search.module';
import { RecentlyViewedAdsService } from './modules/recently-viewed-ads/recently-viewed-ads.service';
import { RecentlyViewedAdsController } from './modules/recently-viewed-ads/recently-viewed-ads.controller';
import { RecentlyViewedAdsModule } from './modules/recently-viewed-ads/recently-viewed-ads.module';
import { FollowStoreModule } from './modules/follow-store/follow-store.module';
import { ReportStoreModule } from './modules/report-store/report-store.module';
import { FollowStoreController } from './modules/follow-store/follow-store.controller';
import { ReportStoreController } from './modules/report-store/report-store.controller';
import { FollowStoreService } from './modules/follow-store/follow-store.service';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    AuthModule,
    AdModule,
    CategoriesModule,
    PrismaModule,
    RegionsModule,
    StoreModule,
    UsersModule,
    ModelsModule,
    StoriesModule,
    ReviewsModule,
    SearchModule,
    CompareAdsModule,
    RecentlyViewedAdsModule,
    FollowStoreModule,
    ReportStoreModule,
    ChatModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: parseInt(configService.get('SMTP_PORT'), 10),
          secure: configService.get('SMTP_SECURE') === 'true',
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASSWORD'),
          },
        },
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files'),
    }),
    FavoriteModule,
  ],
  controllers: [
    AppController,
    RegionsController,
    StoreController,
    UsersController,
    ModelsController,
    StoriesController,
    ReviewsController,
    RecentlyViewedAdsController,
    FollowStoreController,
    ReportStoreController,
  ],
  providers: [
    AppService,
    PrismaService,
    RegionsService,
    StoreService,
    UsersService,
    ModelsService,
    StoriesService,
    ReviewsService,
    EventsService,
    RecentlyViewedAdsService,
    FollowStoreService,
    ReportStoreService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTemplateInterceptor,
    },
  ],
})
export class AppModule {}
