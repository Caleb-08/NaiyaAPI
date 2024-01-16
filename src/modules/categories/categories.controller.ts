import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateCategory,
  CreateSubCategory,
  UpdateCategoryDto,
  UpdateSubCategoryDto,
} from './dto';
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post('createCategory')
  @UseInterceptors(
    FileInterceptor('thumbnail', { limits: { fileSize: 10000000 } }),
  )
  createCategory(@Body() data: CreateCategory, @UploadedFile() file: any) {
    console.log(data, file);
    return this.categoriesService.createCategory(data, file);
  }

  @Get('allCategories')
  getAllPages() {
    return this.categoriesService.getAllCategories();
  }

  @Get('allCategoriesAndSubCategories')
  allCategoriesAndSubCategories() {
    return this.categoriesService.allCategoriesAndSubCategories();
  }

  @Get('getCategoriesById/:id')
  getCategoriesById(@Param('id') categoryId: string) {
    return this.categoriesService.getCategoriesById(categoryId);
  }

  @Put('updateCategory/:id')
  @UseInterceptors(
    FileInterceptor('thumbnail', { limits: { fileSize: 10000000 } }),
  )
  async updateCategory(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
    @UploadedFile() file: any,
  ) {
    return this.categoriesService.updateCategory(id, data, file);
  }

  @Post('createSubCategory')
  @UseInterceptors(
    FileInterceptor('thumbnail', { limits: { fileSize: 10000000 } }),
  )
  createSubCategory(
    @Body() data: CreateSubCategory,
    @UploadedFile() file: any,
  ) {
    console.log(data, file);
    return this.categoriesService.createSubCategory(data, file);
  }

  @Get('allSubCategories')
  getAllSubCategories() {
    return this.categoriesService.getAllSubCategories();
  }

  @Get('getSubCategoriesById/:id')
  getSubCategoriesById(@Param('id') subCategoryId: string) {
    return this.categoriesService.getSubCategoriesById(subCategoryId);
  }

  @Put('updateSubCategory/:id')
  @UseInterceptors(
    FileInterceptor('thumbnail', { limits: { fileSize: 10000000 } }),
  )
  async updateSubCategory(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
    @UploadedFile() file: any,
  ) {
    return this.categoriesService.updateSubCategory(id, updateSubCategoryDto, file);
  }
}
