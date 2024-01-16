import { IsNumber, IsOptional, IsString } from "class-validator";

export class SearchAdsDto {
  @IsString()
  @IsOptional()
  q: string;

  @IsString()
  @IsOptional()
  subCat: string = null;

  @IsOptional()
  minPrice: number;

  @IsString()
  @IsOptional()
  maxPrice: string;

  @IsString()
  @IsOptional()
  brand: string;
}
