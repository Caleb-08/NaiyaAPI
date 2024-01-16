import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateModelDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
