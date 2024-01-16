// stories.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoryDTO, UpdateStoryDto } from './dto';
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post('createStory')
  async createStory(@Body() storyDto: StoryDTO) {
    return this.storiesService.createStory(storyDto);
  }

  @Get('getAllStories')
  async getAllStories() {
    try {
      return await this.storiesService.getStories();
    } catch (error) {
      return { error: error.message || 'Error fetching stories.' };
    }
  }

  @Put('updateStory/:id')
  updateStory(@Body() data: UpdateStoryDto, @Param('id') id: string) {
    console.log({ data });
    return this.storiesService.updateStory(data, id);
  }

  @Delete('deleteStory/:id')
  deleteStory(@Param('id') id: string) {
    return this.storiesService.deleteStory(id);
  }
}
