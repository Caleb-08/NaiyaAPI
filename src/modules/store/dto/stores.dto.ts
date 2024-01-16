import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStore {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  subCategoryId: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsOptional()
  state: string;

  @ApiProperty()
  @IsOptional()
  city: string;

  @ApiProperty()
  @IsOptional()
  storeAddress: string;

  @ApiProperty()
  @IsOptional()
  facebook: string;

  @ApiProperty()
  @IsOptional()
  messenger: string;

  @ApiProperty()
  @IsOptional()
  instagram: string;

  @ApiProperty()
  @IsOptional()
  whatsApp: string;

  @ApiProperty()
  @IsOptional()
  telegram: string;

  @ApiProperty()
  @IsOptional()
  externalURL: string;

  @ApiProperty()
  @IsOptional()
  openingHour: string;

  @ApiProperty()
  @IsOptional()
  closingHour: string;

  @ApiProperty()
  @IsOptional()
  workingDays: string[];

  @ApiProperty()
  @IsOptional()
  deliverTo: string[];

  // @ApiProperty()
  // @IsOptional()
  // isDisabled: boolean;
}

export class UpdateStore {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsString()
  @Matches(/^\+234([789][01]|2[0-9])\d{8}$/, {
    message: 'Enter a valid phone number starting with +234',
  })
  @IsOptional()
  phoneNumber: string;

  @IsMongoId()
  @IsOptional()
  categoryId: string;

  @IsOptional()
  description: string;

  @IsOptional()
  state: string;

  @IsOptional()
  city: string;

  @IsOptional()
  storeAddress: string;

  @IsOptional()
  facebook: string;

  @IsOptional()
  messenger: string;

  @IsOptional()
  instagram: string;

  @Matches(/^\+234([789][01]|2[0-9])\d{8}$/, {
    message: 'Enter a valid WhatsApp number starting with +234',
  })
  @IsOptional()
  whatsApp: string;

  @Matches(/^\+234([789][01]|2[0-9])\d{8}$/, {
    message: 'Enter a valid Telegram number starting with +234',
  })
  @IsOptional()
  telegram: string;

  @Matches(/^(http(s)?:\/\/)(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\S*)?$/, {
    message: 'Enter a valid URL',
  })
  @IsOptional()
  externalURL: string;

  @IsOptional()
  openingHour: string;

  @IsOptional()
  closingHour: string;

  @IsOptional()
  @IsArray()
  workingDays: string[];

  @IsOptional()
  @IsArray()
  deliverTo: string[];
}
