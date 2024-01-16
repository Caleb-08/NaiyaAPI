import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StoryDTO } from './dto';
import { httpErrorException } from 'src/core/services/utility.service';

@Injectable()
export class StoriesService {
  constructor(private prisma: PrismaService) {}

  async createStory(storyData: StoryDTO) {
    try {
      return await this.prisma.story.create({
        data: {
          thumbnail: storyData.thumbnail,
          title: storyData.title,
          stories: storyData.stories,
          isPublished: storyData.isPublished,
        },
      });
    } catch (error) {
      console.error('Error creating story:', error);
      throw new Error('An error occurred while creating the story.');
    }
  }

  async getStories() {
    try {
      return await this.prisma.story.findMany({
        where: {
          isPublished: true,
        },
      });
    } catch (error) {
      console.error('Error fetching story:', error);
      throw new Error('An error occurred while fetching the story.');
    }
  }

  async updateStory(storyData: StoryDTO, storyId: string): Promise<any> {
    try {
      return await this.prisma.story.update({
        where: {
          id: storyId,
        },
        data: {
          thumbnail: storyData.thumbnail,
          title: storyData.title,
          stories: storyData.stories,
          isPublished: storyData.isPublished,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async deleteStory(storyId: string): Promise<any> {
    try {
      return await this.prisma.story.delete({
        where: {
          id: storyId,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }
}
