import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageSender, MessageType } from '@prisma/client';

export class SendMessage {
  @ApiProperty({ example: '64c2cbe7614c49c7ab9c97e6' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: '653c26fbc80590c23f20cce3' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  storeId: string;

  @ApiProperty({ example: 'User' })
  @IsString()
  @IsNotEmpty()
  sender: MessageSender;

  @ApiProperty({ example: 'Text' })
  @IsString()
  @IsNotEmpty()
  messageType: MessageType;

  @ApiProperty({ example: 'Hello world' })
  @IsString()
  @IsOptional()
  text: string;

  @ApiProperty({ example: [] })
  @IsArray()
  @IsOptional()
  media: any[];

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  conversationId: string;
}

export class CreateConversation {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  storeId: string;
}
