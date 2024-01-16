import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModelDto } from './dto/create-model.dto';

@Injectable()
export class ModelsService {
  constructor(private prisma: PrismaService) {}

  async createModel(createModelDto: CreateModelDto) {
    const { name } = createModelDto;
    const model = await this.prisma.model.create({
      data: { name },
    });
    return model;
  }
}
