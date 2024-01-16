import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Delete,
  Req,
  NotFoundException,
} from '@nestjs/common'; // Import Req from '@nestjs/common'
import { FavoriteService } from './favorite.service';
import { AuthService } from '../auth/auth.service'; // Import your AuthService
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Favourites')
@Controller('wishLists')
export class FavoriteController {
  constructor(
    private readonly favoriteService: FavoriteService,
    private readonly authService: AuthService, // Inject AuthService
  ) {}

  @Post('addWishList')
  async addFavorites(@Body() request: { userId: string, adsIds: string[] }, @Req() req: any) {
    try {
      // Extract user ID from the request
      const userId = request.userId;

      // Call the service method to add the ads to the user's favorites
      const result = await this.favoriteService.addFavorites(userId, request.adsIds);

      return result;
    } catch (error) {
      // Log the error for debugging
      console.error(error);

      throw new HttpException(
        'Failed to update favorites',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Delete('removeWishList/:userId/:adId')
  async removeFavorite(@Param('userId') userId: string, @Param('adId') adId: string) {
    try {
      // Call the service method to remove the ad from the user's favorites
      await this.favoriteService.removeFavorite(userId, adId);

      return { message: 'Ad removed from favorites successfully' };
    } catch (error) {
      // Log the error for debugging
      console.error(error);

      // Check for NotFoundException and handle it with a 404 status code
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'Failed to remove ad from favorites',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getAllWishListAds/:userId')
  async getAllFavoriteAds(@Param('userId') userId: string) {
    try {
      // Call the service method to get all favorite ads for the user
      const favoriteAds = await this.favoriteService.getAllFavoriteAds(userId);

      if (favoriteAds.length === 0) {
        throw new NotFoundException('No favorite ads found for the user');
      }

      return favoriteAds;
    } catch (error) {
      // Log the error for debugging
      console.error(error);

      // Check for NotFoundException and handle it with a 404 status code
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'Failed to retrieve favorite ads',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
