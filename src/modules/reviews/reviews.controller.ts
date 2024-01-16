import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { CreateReviewDto, UpdateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}

  @Post('createReview')
  async createReview(@Body(ValidationPipe) reviewData: CreateReviewDto) {
    return this.reviewService.createReview(reviewData);
  }

  @Put('updateReview/:id')
  async updateReview(
    @Param('id') reviewId: string,
    @Body(ValidationPipe) updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(reviewId, updateReviewDto);
  }
  @Delete('deleteReview/:id')
  async deleteReview(@Param('id') reviewId: string) {
    return this.reviewService.deleteReview(reviewId);
  }

  @Get('getAllReviews')
  async getAllReviews() {
    return this.reviewService.getAllReviews();
  }

  @Get('getReview/store/:storeId')
  async getReviewsByStoreId(@Param('storeId') storeId: string) {
    return this.reviewService.getReviewsByStoreId(storeId);
  }

  @Get('getReview/:id')
  async getReviewById(@Param('id') reviewId: string) {
    return this.reviewService.getReviewById(reviewId);
  }
}
