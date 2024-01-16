import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CompareAdsDto {
  @IsOptional()
  @IsMongoId()
  compareUserId: string;

  @IsNotEmpty()
  @IsArray()
  comparedAds: any[];
}
