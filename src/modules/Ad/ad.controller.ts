import {
  Body,
  Controller,
  Get,
  Param,
  Delete,
  Put,
  Post,
  UploadedFiles,
  UseInterceptors,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdService } from './ad.service';
import { CreateAdDto, PublishAndUnPublishAd } from './dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

// @UseInterceptors(CacheInterceptor)
@ApiTags('Ads')
@Controller('ad')
export class AdController {
  constructor(private adService: AdService) {}

  @UseGuards(AuthGuard('auth'))
  @Post('createAd')
  createAd(@Body() data: CreateAdDto, @Req() req: any): Promise<any> {
    return this.adService.createAd(data, req.user.id);
  }

  @UseGuards(AuthGuard('auth'))
  @Put('publishAndUnPublishAd')
  publishAndUnPublishAd(
    @Body() data: PublishAndUnPublishAd,
    @Req() req: any,
  ): Promise<any> {
    return this.adService.publishAndUnPublishAd(data, req.user.id);
  }

  @UseGuards(AuthGuard('auth'))
  @Put('update/:id')
  async updateAd(
    @Param('id') id: string,
    @Body() adData: CreateAdDto,
  ): Promise<any> {
    return await this.adService.updateAd(id, adData);
  }

  @UseGuards(AuthGuard('auth'))
  @Post('uploadAdImage')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 20 }]))
  uploadAdImage(
    @UploadedFiles() files: Record<string, any>,
    @Body() adData: any,
  ) {
    return this.adService.uploadAdImage(files, adData.adId);
  }

  @UseGuards(AuthGuard('auth'))
  @Post('updateImageDetails')
  updateImageDetails(@Body() data: any) {
    return this.adService.updateImageDetails(data.adId, data.imagesPayload);
  }

  @UseGuards(AuthGuard('auth'))
  @Post('uploadAdVideo')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'video', maxCount: 1 }]))
  uploadAdVideo(
    @UploadedFiles() files: Record<string, any>,
    @Body() adData: any,
  ) {
    return this.adService.uploadAdVideo(files, adData.adId);
  }

  @Delete('delete/:id')
  async deleteAd(@Param('id') id: string): Promise<void> {
    return await this.adService.deleteAd(id);
  }

  @Get('getAllAds')
  @CacheKey('getAllAds') // Define a cache key for this method
  @UseInterceptors(CacheInterceptor)
  async getAllAds(): Promise<any[]> {
    return await this.adService.getAllAds();
  }

  @Get('getAd/:id')
  async getAdById(@Param('id') id: string): Promise<any> {
    return await this.adService.getAdById(id);
  }
  @Get('getAdDetails/:slug')
  async getAdBySlug(
    @Param('slug') slug: string,
    @Query('analytics') analytics: string,
  ): Promise<any> {
    return await this.adService.getAdBySlug(slug, analytics);
  }

  @Get('getAd/subcategory/:subcategoryId')
  async getAdsBySubcategoryId(@Param('subcategoryId') subCategoryId: string) {
    return this.adService.getAdsBySubcategoryId(subCategoryId);
  }
}
