import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateState {
  @IsArray()
  @IsNotEmpty()
  states: string[];
}

export class CreateCities {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsArray()
  @IsNotEmpty()
  cities: string[];
}
