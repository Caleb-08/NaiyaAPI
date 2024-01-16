import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  generateSlug,
  httpErrorException,
} from '../../core/services/utility.service';
import { UpdateCategoryDto, UpdateSubCategoryDto } from './dto';
import { FileUploadService } from '../../core/services/file-upload.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async createCategory(categoryData: any, thumbnail: any): Promise<any> {
    let thumbnailURL: string;
    await this.fileUploadService
      .uploadImage(thumbnail, 'thumbnails/categories')
      .then((res) => {
        thumbnailURL = res;
      });

    const categorySlug = generateSlug(categoryData.name);

    try {
      return await this.prisma.categories.create({
        data: {
          name: categoryData.name,
          slug: categorySlug,
          thumbnail: thumbnailURL,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getAllCategories() {
    try {
      return await this.prisma.categories.findMany();
    } catch (error) {
      httpErrorException(error);
    }
  }

  async allCategoriesAndSubCategories() {
    try {
      return await this.prisma.categories.findMany({
        include: {
          subCategories: true,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getCategoriesById(CategoryId: any) {
    try {
      return await this.prisma.categories.findUnique({
        where: {
          id: CategoryId,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async updateCategory(
    id: string,
    categoryData: UpdateCategoryDto,
    thumbnail: any,
  ): Promise<any> {
    let thumbnailURL: string;
    await this.fileUploadService
      .uploadImage(thumbnail, 'thumbnails/categories')
      .then((res) => {
        thumbnailURL = res;
      });

    return this.prisma.categories.update({
      where: { id },
      data: {
        name: categoryData.name,
        thumbnail: thumbnailURL,
      },
    });
  }

  async createSubCategory(subCategoryData: any, thumbnail: any): Promise<any> {
    const subCategorySlug = generateSlug(subCategoryData.name);
    const subCatExist = await this.prisma.subCategories.findFirst({
      where: {
        slug: subCategorySlug,
      },
    });

    if (subCatExist) {
      httpErrorException(
        'Subcategory with this name or this slug (' +
          subCategorySlug +
          ') already exist',
      );
    }

    // Parse the "fields" data from the string in subCategoryData
    const fields = JSON.parse(subCategoryData.fields);

    if (fields.length === 0) {
      httpErrorException('Subcategory must include at least one field');
    }

    let thumbnailURL: string;
    await this.fileUploadService
      .uploadImage(thumbnail, 'thumbnails/subCategories')
      .then((res) => {
        thumbnailURL = res;
      });

    try {
      return await this.prisma.subCategories.create({
        data: {
          category: {
            connect: {
              id: subCategoryData.categoryId,
            },
          },
          name: subCategoryData.name,
          slug: subCategorySlug,
          thumbnail: thumbnailURL,
          fields: fields, // Use the parsed fields data
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getAllSubCategories() {
    try {
      return await this.prisma.subCategories.findMany();
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getSubCategoriesById(subCategoryId: any): Promise<any> {
    try {
      return await this.prisma.subCategories.findUnique({
        where: {
          id: subCategoryId,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async updateSubCategory(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
    thumbnail: any | null,
  ): Promise<any> {
    const { name, fields } = updateSubCategoryDto;

    let thumbnailURL: string | undefined;

    if (thumbnail) {
      await this.fileUploadService
        .uploadImage(thumbnail, 'thumbnails/subCategories')
        .then((res) => {
          thumbnailURL = res;
        });
    }

    // Ensure that fields is a string before parsing it
    const fieldsString: string = Array.isArray(fields)
      ? JSON.stringify(fields)
      : fields;

    // Parse the "fields" data from the string in updateSubCategoryDto
    const updatedFields = JSON.parse(fieldsString);

    const updatedData: any = {
      name,
      fields: updatedFields, // Update Fields data with the parsed value
    };

    if (thumbnailURL) {
      updatedData.thumbnail = thumbnailURL;
    }

    return this.prisma.subCategories.update({
      where: { id },
      data: updatedData,
    });
  }
}
