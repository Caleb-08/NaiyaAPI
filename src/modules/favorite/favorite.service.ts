import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  async addFavorites(userId: string, adsIds: string[]) {
    try {
      // Fetch the user's current favorites
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { itFavorite: true },
      });

      // Check if the user exists
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Extract the current favorite IDs and convert them to a Set for uniqueness
      const currentFavorites = new Set(user.itFavorite);

      // Add the new ads to the set of favorites
      adsIds.forEach((adId) => currentFavorites.add(adId));

      // Convert the set back to an array
      const updatedFavorites = [...currentFavorites];

      // Update the user's favorites in the database
      await this.prisma.user.update({
        where: { id: userId },
        data: { itFavorite: updatedFavorites },
      });

      return { message: 'Favorites updated successfully' };
    } catch (error) {
      // Log the error for debugging
      console.error(error);

      throw new HttpException(
        'Failed to update favorites',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

    async removeFavorite(userId: string, adId: string) {
      try {
        // Fetch the user's current favorites
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { itFavorite: true },
        });
  
        if (!user) {
          throw new NotFoundException('User not found');
        }
  
        // Check if the ad to remove exists in the user's favorites
        if (!user.itFavorite.includes(adId)) {
          throw new NotFoundException('Ad not found in favorites');
        }
  
        // Remove the ad from the user's favorites
        const updatedFavorites = user.itFavorite.filter((favoriteId) => favoriteId !== adId);
  
        // Update the user's favorites in the database
        await this.prisma.user.update({
          where: { id: userId },
          data: { itFavorite: updatedFavorites },
        });
  
        return { message: 'Ad removed from favorites successfully' };
      } catch (error) {
        console.error(error);
  
        throw new HttpException(
          'Failed to remove ad from favorites',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    async getAllFavoriteAds(userId: string) {
      try {
        // Fetch the user's current favorites
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { itFavorite: true },
        });
  
        if (!user) {
          throw new NotFoundException('User not found');
        }
  
        // Extract the favorite ad IDs
        const favoriteAdIds = user.itFavorite || [];
  
        // Fetch the full details of favorite ads based on their IDs
        const favoriteAds = await this.prisma.ads.findMany({
          where: {
            id: { in: favoriteAdIds },
          },
        });
  
        return favoriteAds;
      } catch (error) {
        console.error(error);
  
        throw new HttpException(
          'Failed to retrieve favorite ads',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

