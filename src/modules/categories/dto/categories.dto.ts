import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategory {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateSubCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsNotEmpty()
  fields: any[];
}

export class UpdateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  fields: any[];

}

export class CreateSubCategory {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;


  @IsNotEmpty()
  fields: any[];

}
