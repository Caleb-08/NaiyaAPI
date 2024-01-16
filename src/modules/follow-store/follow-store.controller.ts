import { Controller, Param, Post, Req } from '@nestjs/common';
import { FollowStoreService } from './follow-store.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('Follow Store')
@ApiBearerAuth()
@Controller('follow-store')
export class FollowStoreController {
  constructor(private readonly followStoreService: FollowStoreService) {}

  @ApiOperation({ summary: 'Follow a store by store ID' })
  @ApiParam({
    name: 'storeId',
    description: 'ID of the store to follow',
    type: 'string',
  })
  @Post('follow/:storeId')
  async followStore(
    @Param('storeId') storeId: string,
    @Req() request: any,
  ): Promise<void> {
    const userId = request.user.id;

    await this.followStoreService.followStore(userId, storeId);
  }
}
