import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import { SendMessage } from './dto';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(AuthGuard('auth'))
  @Post('sendMessage')
  sendMessage(@Body() data: SendMessage): Promise<any> {
    return this.chatService.sendMessage(data);
  }

  @UseGuards(AuthGuard('auth'))
  @Get('getUserConversations')
  getUserConversations(@Req() req: any): Promise<any> {
    return this.chatService.getUserConversations(req.user.id);
  }

  @UseGuards(AuthGuard('auth'))
  @Get('getStoreConversations')
  getStoreConversations(@Param('storeId') storeId: string): Promise<any> {
    return this.chatService.getStoreConversations(storeId);
  }

  @UseGuards(AuthGuard('auth'))
  @Get('getConversationMessages')
  getConversationMessages(
    @Param('conversationId') conversationId: string,
  ): Promise<any> {
    return this.chatService.getConversationMessages(conversationId);
  }

  // @UseGuards(AuthGuard('auth'))
  @Delete('deleteMessages')
  deleteMessages(@Param('messageId') messageId: string): Promise<any> {
    return this.chatService.deleteMessages(messageId);
  }
}
