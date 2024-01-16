import { Controller, Get, Query, Request, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request as requestType } from 'express';
import { SearchAdsDto } from './dto';
import { ApiTags } from "@nestjs/swagger";

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<requestType>();

    if (request.method === 'GET') {
      const url = request.url;
      const query = request.originalUrl.split('?')[1] || ''; // Get the query string
      return `${url}?${query}`;
    }

    return undefined;
  }
}

// @UseInterceptors(CustomCacheInterceptor)
@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  // @CacheKey('searchAds')
  @Post('searchAds')
  async searchAds(
    @Request() request: any,
    @Body() querry: any,
  ): Promise<any[]> {
    return this.searchService.searchAds(request, querry);
  }

  @Get('getRelatedSearchCategories')
  async getRelatedSearchCategories(
    @Query() searchAdsDto: SearchAdsDto,
    @Request() request: any,
  ): Promise<any[]> {
    return this.searchService.getRelatedSearchCategories(searchAdsDto);
  }

  @Get('getSearchSuggestion')
  async getSearchSuggestion(@Query('query') query: string): Promise<any[]> {
    return await this.searchService.getSearchSuggestion(query);
  }

  @Get('getTrendingSearch')
  async getTrendingSearch(): Promise<any[]> {
    return await this.searchService.getTrendingSearch();
  }
}
