import {
  IsArray, IsBoolean,
  IsMongoId,
  IsNotEmpty, IsNumber,
  IsOptional,
  IsString, Min
} from "class-validator";

export class CreateAdDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsOptional()
  adData: any;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  subCategoryId: string;

  @IsMongoId()
  @IsNotEmpty()
  @IsMongoId()
  cityId: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  storeId: string;
}

export class PublishAndUnPublishAd {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  adId: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  storeId: string;

  @IsBoolean()
  @IsNotEmpty()
  isPublished: boolean;
}
