import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CompareAdsService } from './compare-ads.service';
import { CompareAdsDto } from './dto/compare-ads.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Compare Ads')
@Controller('compare')
export class CompareAdsController {
  constructor(private readonly compareAdsService: CompareAdsService) {}

  @Post('saveComparedAds')
  @HttpCode(HttpStatus.CREATED)
  async saveComparedAds(@Body() data: CompareAdsDto): Promise<any> {
    return await this.compareAdsService.saveComparedAds(data);
  }

  @Get('getComparedAdsById/:compareId')
  @HttpCode(HttpStatus.CREATED)
  async getComparedAdsById(
    @Param('compareId') compareId: string,
  ): Promise<any> {
    return this.compareAdsService.getComparedAdsById(compareId);
  }

  @UseGuards(AuthGuard('auth'))
  @Get('getAllUserComparedAds/:userId')
  @HttpCode(HttpStatus.CREATED)
  async getAllUserComparedAds(@Param('userId') userId: string): Promise<any> {
    return this.compareAdsService.getAllUserComparedAds(userId);
  }

  @UseGuards(AuthGuard('auth'))
  @Get('getAllStoreComparedAds/:storeId')
  @HttpCode(HttpStatus.CREATED)
  async getAllStoreComparedAds(
    @Param('storeId') storeId: string,
  ): Promise<any> {
    return this.compareAdsService.getAllStoreComparedAds(storeId);
  }
}
