import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [FavoriteService],
  controllers: [FavoriteController],
  imports: [AuthModule],
})
export class FavoriteModule {}
