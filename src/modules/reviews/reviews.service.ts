import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(reviewData: CreateReviewDto) {
    try {
      const { comment, rating, userId, storeId } = reviewData;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      const ad = await this.prisma.ads.findFirst({
        where: { storeId },
        select: { slug: true }, // Fetching ad slug instead of ad id
      });

      if (!user) {
        throw new Error(`User with id ${userId} not found.`);
      }

      if (!ad) {
        throw new Error(`Ad for storeId ${storeId} not found.`);
      }

      const createdReview = await this.prisma.review.create({
        data: {
          comment,
          rating: parseInt(rating),
          avatar: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
          user: { connect: { id: userId } },
          store: { connect: { id: storeId } },
          ad: { connect: { slug: ad.slug } },
        },
      });

      return { ...createdReview, username: user.name, adSlug: ad.slug };
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('An error occurred while creating the review.');
    }
  }
  async updateReview(reviewId: string, updateReviewData: UpdateReviewDto) {
    try {
      const { comment, rating } = updateReviewData;

      return await this.prisma.review.update({
        where: { id: reviewId },
        data: {
          comment,
          rating: parseInt(rating),
        },
      });
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('An error occurred while updating the review.');
    }
  }
  async deleteReview(reviewId: string) {
    try {
      return await this.prisma.review.delete({
        where: { id: reviewId },
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('An error occurred while deleting the review.');
    }
  }

  async getAllReviews() {
    try {
      return await this.prisma.review.findMany();
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw new Error('An error occurred while fetching all reviews.');
    }
  }

  async getReviewsByStoreId(storeId: string) {
    try {
      return await this.prisma.review.findMany({
        where: {
          storeId,
        },
      });
    } catch (error) {
      console.error('Error fetching reviews by store ID:', error);
      throw new Error('An error occurred while fetching reviews by store ID.');
    }
  }
  async getReviewById(reviewId: string) {
    try {
      return await this.prisma.review.findUnique({
        where: {
          id: reviewId,
        },
      });
    } catch (error) {
      console.error('Error fetching review by ID:', error);
      throw new Error('An error occurred while fetching the review by ID.');
    }
  }
}
