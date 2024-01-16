import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { FileUploadService } from '../../core/services/file-upload.service';

@Module({
  providers: [CategoriesService, FileUploadService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
