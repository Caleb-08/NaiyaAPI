import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password?: string;

  @IsOptional()
  isAdmin?: boolean;

  @IsOptional()
  subscriptionPlan?: any;

  @IsOptional()
  subscriptionDuration?: any;
}

export class LoginDTO {
  @ApiProperty({ example: 'abc@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'abc@gmail.com' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ContinueWithGoogle {
  @IsString()
  @IsNotEmpty()
  googleJWTToken: string;
}
