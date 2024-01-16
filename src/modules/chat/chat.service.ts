import { Injectable } from '@nestjs/common';
import { CreateConversation, SendMessage } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { httpErrorException } from '../../core/services/utility.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
  async sendMessage(data: SendMessage): Promise<any> {
    if (!data.conversationId) {
      const conversation = await this.createConversation({
        userId: data.userId,
        storeId: data.storeId,
      });
      data.conversationId = conversation.id;
    }

    const message = await this.prisma.messages.create({
      data: {
        messageType: data.messageType,
        text: data.text,
        media: data.media,
        sender: data.sender,
        senderId: data.sender === 'User' ? data.userId : data.storeId,
        conversationId: data.conversationId,
      },
    });

    await this.prisma.conversations.update({
      where: {
        id: data.conversationId,
      },
      data: {
        lastMessage: data.text ? data.text : data.messageType,
      },
    });

    return message;
  }

  async createConversation(data: CreateConversation): Promise<any> {
    const checkIfConversationAlreadyExistForUserAndStore =
      await this.prisma.conversations.findFirst({
        where: {
          userId: data.userId,
          storeId: data.storeId,
        },
      });
    if (checkIfConversationAlreadyExistForUserAndStore) {
      return checkIfConversationAlreadyExistForUserAndStore;
    } else {
      return this.prisma.conversations.create({
        data: {
          userId: data.userId,
          storeId: data.storeId,
        },
      });
    }
  }

  async getUserConversations(userId: string): Promise<any[]> {
    try {
      return this.prisma.conversations.findMany({
        where: {
          userId: userId,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          Messages: true,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getStoreConversations(storeId: string): Promise<any[]> {
    try {
      return this.prisma.conversations.findMany({
        where: {
          storeId: storeId,
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
          Messages: true,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getConversationMessages(conversationId: string): Promise<any[]> {
    try {
      return this.prisma.messages.findMany({
        where: {
          conversationId: conversationId,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async deleteMessages(messageId: string) {
    try {
      const message = await this.prisma.messages.findFirst({
        where: {
          id: messageId,
        },
      });

      console.log('QWERTYUIOP', message);

      if (message) {
        // delete all media associated with this message
      }
      return this.prisma.messages.delete({
        where: {
          id: messageId,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }
}
