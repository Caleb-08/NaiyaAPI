import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StoryDTO {
  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  stories: any[];

  @IsOptional()
  isPublished: boolean;
}

export interface story {
  image: string;
  buttonUrl: string;
  buttonText: string;
  buttonColour: string;
  buttonTextColour: string;
  buttonBorderColour: string;
}

export class UpdateStoryDto {
  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  stories: any[];

  @IsOptional()
  isPublished: boolean;
}
