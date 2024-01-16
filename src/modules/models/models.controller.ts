import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ModelsService } from './models.service';
import { CreateModelDto } from './dto/create-model.dto';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createModel(@Body() createModelDto: CreateModelDto) {
    const model = await this.modelsService.createModel(createModelDto);
    return model;
  }
}
