import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStore, UpdateStore } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiParam, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private storeService: StoreService) {}

  @ApiOperation({ summary: 'Get all store ads by store slug' })
  @ApiParam({ name: 'slug', description: 'Slug of the store', type: 'string' })
  @Get('getAllStoreAds/:slug')
  getAllStoreAds(@Param('slug') slug: string) {
    return this.storeService.getAllStoreAds(slug);
  }

  @ApiOperation({ summary: 'Create a store' })
  @ApiBody({ type: CreateStore })
  @UseGuards(AuthGuard('auth'))
  @Post('createStore')
  createStore(@Body() data: CreateStore, @Req() req: any): Promise<any> {
    return this.storeService.createStore(data, req.user.id);
  }

  @ApiOperation({ summary: 'Get all stores' })
  @Get('getAllStores')
  getAllStores() {
    return this.storeService.getAllStores();
  }

  @ApiOperation({ summary: 'Check if store slug exists' })
  @ApiParam({ name: 'slug', description: 'Slug of the store', type: 'string' })
  @Get('checkIfStoreSlugExist/:slug')
  checkIfStoreSlugExist(@Param('slug') slugId: string) {
    return this.storeService.checkIfStoreSlugExist(slugId);
  }

  @ApiOperation({ summary: 'Get store by ID or slug' })
  @ApiParam({
    name: 'slug',
    description: 'ID or slug of the store',
    type: 'string',
  })
  @Get('getStoreByIdOrSlug/:slug')
  getStoreByIdOrSlug(@Param('slug') slugId: string) {
    return this.storeService.getStoreByIdOrSlug(slugId);
  }

  @ApiOperation({ summary: 'Get all user stores by user ID' })
  @ApiParam({ name: 'id', description: 'ID of the user', type: 'string' })
  @Get('getAllUserStoresByUserId/:id')
  getAllUserStoresByUserId(@Param('id') id: string) {
    return this.storeService.getAllUserStoresByUserId(id);
  }

  @ApiOperation({ summary: 'Update a store by ID' })
  @ApiBody({ type: UpdateStore })
  @Put('updateStore/:id')
  updateStore(@Body() data: UpdateStore, @Param('id') id: string) {
    console.log({ data });
    return this.storeService.updateStore(data, id);
  }

  @ApiOperation({ summary: 'Disable a store by store ID' })
  @UseGuards(AuthGuard('auth'))
  @Put('disableStore/:storeId')
  disableStore(@Req() req: any, @Param('storeId') storeId: string) {
    return this.storeService.disableStore(req, storeId);
  }

  @ApiOperation({ summary: 'Enable a store by store ID' })
  @UseGuards(AuthGuard('auth'))
  @Put('enableStore/:storeId')
  enableStore(@Req() req: any, @Param('storeId') storeId: string) {
    return this.storeService.enableStore(req, storeId);
  }

  @ApiOperation({ summary: 'Delete a store and all its ads by ID' })
  @Delete('deleteStoreAndAllItAds/:id')
  deleteStoreAndAllItAds(@Param('id') id: string) {
    return this.storeService.deleteStoreAndAllItAds(id);
  }

  @ApiOperation({ summary: 'Get store by ad ID' })
  @ApiParam({
    name: 'adId',
    description: 'ID of the ad associated with the store',
    type: 'string',
  })
  @UseGuards(AuthGuard('auth'))
  @Get('getStoreByAdId/:adId')
  getStoreByAdId(@Param('adId') adId: string): Promise<any> {
    return this.storeService.getStoreByAdId(adId);
  }
}
