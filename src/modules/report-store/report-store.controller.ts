import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportStoreDto } from './dto/report-store.dto';
import { ReportStoreService } from './report-store.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('Report Store')
@ApiBearerAuth()
@Controller('report-store')
export class ReportStoreController {
  constructor(private reportStoreService: ReportStoreService) {}

  @ApiOperation({ summary: 'Report a store by store ID' })
  @ApiParam({
    name: 'storeId',
    description: 'ID of the store to report',
    type: 'string',
  })
  @ApiBody({ type: ReportStoreDto })
  @UseGuards(AuthGuard('auth'))
  @Post(':storeId/report')
  reportStore(
    @Param('storeId') storeId: string,
    @Body() reportStoreDto: ReportStoreDto,
  ) {
    return this.reportStoreService.reportStore(storeId, reportStoreDto);
  }

  @ApiOperation({ summary: 'Get all reported stores' })
  @ApiResponse({
    status: 200,
    description: 'List of reported stores',
    type: [ReportStoreDto],
  })
  @Get('reported')
  getAllReportedStores() {
    return this.reportStoreService.getAllReportedStores();
  }
}
